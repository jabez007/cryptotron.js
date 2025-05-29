import { getCharOffset, modulo, transform } from '@utils';

function findInverse(a: number): number {
  if (!Number.isInteger(a)) {
    throw new Error('Input value must be an integer');
  }

  for (let i = 1; i < 26; i += 1) {
    if ((a * i) % 26 === 1) {
      return i;
    }
  }
  return NaN;
}

export function decrypt(key: { alpha: number; beta: number }) {
  if (!(Number.isInteger(key.alpha) && Number.isInteger(key.beta))) {
    throw new Error('Both key values must be integers');
  }

  const inverse = findInverse(key.alpha);
  if (Number.isNaN(inverse)) {
    throw new Error(`No inverse found for alpha value ${key.alpha}`);
  }

  return transform((char, index, cipher) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(inverse * ((cipher.charCodeAt(index) - offset) - key.beta), 26) +
        offset,
    );
  });
}
