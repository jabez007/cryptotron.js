export function getCharOffset(val: string) {
  if (val.length !== 1) {
    throw new Error('Length of input value must be 1');
  }

  return (val.charAt(0) == val.charAt(0).toUpperCase()) ? 65 : 97;
}

export function modulo(n: number, m: number): number {
  if (!(Number.isInteger(n) && Number.isInteger(m))) {
    throw new Error('Both input values must be integers');
  }

  return ((n % m) + m) % m;
}

const re = /[A-Za-z]/;

export function transform(
  transformer: (
    inputChar: string,
    inputIndex: number,
    inputText: string,
  ) => string,
) {
  return (inputText: string): string => {
    let outputText = '';
    for (let i = 0; i < inputText.length; i += 1) {
      const char = inputText.charAt(i);

      if (re.test(char)) {
        outputText += transformer(char, i, inputText);
      } else {
        outputText += char;
      }
    }
    return outputText;
  };
}

export function gcd(a: number, b: number): number {
  if (!(Number.isInteger(a) && Number.isInteger(b))) {
    throw new Error('Both input values must be integers');
  }

  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}

const alphaLower = [...Array(26)]
  .map((_, i) => String.fromCharCode(97 + i))
  .join('');

function getUniqueCharacters(input: string) {
  let unique = '';
  for (let i = 0; i < input.length; i += 1) {
    if (!unique.includes(input[i])) {
      unique += input[i];
    }
  }
  return unique;
}

export function buildCipherSquare(keyword: string) {
  const key = getUniqueCharacters(`${keyword}${alphaLower}`).replace(
    /[jJ]/g,
    '',
  );
  const cipherSquare = new Array(5)
    .fill(null)
    .map(() => new Array(5).fill(null));
  for (let i = 0; i < key.length; i += 1) {
    const char = key.charAt(i);
    const column = i % 5;
    const row = Math.floor(i / 5);
    cipherSquare[row][column] = char;
  }
  return cipherSquare;
}

/*
const alphaUpper = [...Array(26)]
  .map((_, i) => String.fromCharCode(65 + i))
  .join('');
*/
