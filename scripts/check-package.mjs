// Packs the package, installs the tarball into a throwaway project, and checks
// what CommonJS and ESM consumers get from it: at runtime through require() and
// import, and at compile time through tsc under node10, node16, nodenext, and
// bundler.
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { name } = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf8'));
const tscPath = join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');

// Both entry points export the cipher namespaces and the n-gram helpers. The
// full entry also loads trigram and quadgram data, which lite leaves out.
const entries = [['', 'index'], ['/lite', 'lite']];
// Under import, a default key means Node loaded the file as CommonJS
const exportsCheck = (api, how) => `
const how = ${JSON.stringify(how)};
if (Object.hasOwn(${api}, 'default')) throw new Error(how + ': has an unexpected default export');
if (${api}.caesar.encrypt({ shift: 3 })('HELLO') !== 'KHOOR') throw new Error(how + ': caesar.encrypt failed');
if (typeof ${api}.loadNgramData !== 'function') throw new Error(how + ': loadNgramData is missing');
`;
const check = (load) => entries.map(([subpath], i) => `{
const api${i} = ${load}('${name}${subpath}');
${exportsCheck(`api${i}`, `${load} ${name}${subpath}`)}}`).join('\n');
const requireCheck = check('require');
const importCheck = check('await import');
const typeFixture = `
import { caesar, type CipherTransformer } from '${name}';
import { loadNgramData, vigenere } from '${name}/lite';
const shift: CipherTransformer = caesar.encrypt({ shift: 3 });
const text: string = vigenere.decrypt({ keyword: 'KEY' })(shift('HELLO'));
const loading: Promise<void> = loadNgramData(4);
void text;
void loading;
`;
// Types a TypeScript Node app already has
const consumerTypes = ['@types/node'];
// [config name, fixture file, module, moduleResolution, declaration directory tsc must pick]
const typeChecks = [
  ['node10', 'node10.ts', 'CommonJS', 'Node10', 'dist/cjs'],
  ['node16', 'node16.cts', 'Node16', 'Node16', 'dist/cjs'],
  ['nodenext', 'nodenext.mts', 'NodeNext', 'NodeNext', 'dist/esm'],
  ['bundler', 'bundler.ts', 'ESNext', 'Bundler', 'dist/esm'],
];

const temporaryRoot = await mkdtemp(join(tmpdir(), 'check-package-'));
const run = (command, args, cwd, capture = false) => execFileSync(command, args, {
  cwd,
  encoding: capture ? 'utf8' : undefined,
  stdio: capture ? 'pipe' : 'inherit',
});
// On Windows npm is a .cmd launcher, which execFileSync can't start. npm run
// sets npm_execpath to npm's own script, which node can run anywhere.
const npm = (args, cwd) => (process.env.npm_execpath
  ? run(process.execPath, [process.env.npm_execpath, ...args], cwd)
  : run('npm', args, cwd));

try {
  let tarballPath = process.argv[2] ? resolve(process.argv[2]) : null;
  if (!tarballPath) {
    const packDirectory = join(temporaryRoot, 'package');
    await mkdir(packDirectory);
    npm(['pack', '--pack-destination', packDirectory], projectRoot);
    const tarballs = (await readdir(packDirectory)).filter((file) => file.endsWith('.tgz'));
    if (tarballs.length !== 1) throw new Error(`Expected one tarball, found ${tarballs.length}.`);
    tarballPath = join(packDirectory, tarballs[0]);
  }

  const consumerRoot = join(temporaryRoot, 'consumer');
  await mkdir(consumerRoot);
  await writeFile(join(consumerRoot, 'package.json'), JSON.stringify({ private: true }, null, 2));
  npm([
    'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarballPath,
    ...consumerTypes,
  ], consumerRoot);

  run(process.execPath, ['--input-type=commonjs', '--eval', requireCheck], consumerRoot);
  run(process.execPath, ['--input-type=module', '--eval', importCheck], consumerRoot);

  for (const [config, source, module, moduleResolution, directory] of typeChecks) {
    await writeFile(join(consumerRoot, source), typeFixture);
    const configPath = join(consumerRoot, `tsconfig.${config}.json`);
    await writeFile(configPath, JSON.stringify({
      compilerOptions: { target: 'ES2022', module, moduleResolution, strict: true, noEmit: true },
      files: [source],
    }, null, 2));
    run(process.execPath, [tscPath, '-p', configPath], consumerRoot);
    const trace = run(process.execPath, [tscPath, '-p', configPath, '--traceResolution'], consumerRoot, true);
    for (const [subpath, file] of entries) {
      const expected = `${directory}/${file}.d.ts`;
      const resolved = trace.match(new RegExp(`Module name '${name}${subpath}' was successfully resolved to '([^']+)'`));
      if (!resolved?.[1].endsWith(`/${expected}`)) {
        throw new Error(`${config} resolved ${name}${subpath} to ${resolved?.[1] ?? 'nothing'}, expected ${expected}.`);
      }
    }
  }

  console.log(`${name}: require, import, and types verified for node10, node16, nodenext, and bundler`);
} finally {
  if (process.env.KEEP_PACKAGE_TEST_TEMP) {
    console.log(`Package test files kept at ${temporaryRoot}`);
  } else {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}
