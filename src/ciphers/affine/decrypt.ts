import { modulo, re } from '@utils';

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

  return (cipherText: string) => {
    const inverse = findInverse(key.alpha);
    if (Number.isNaN(inverse)) {
      throw new Error(`No inverse found for alpha value ${key.alpha}`);
    }

    let plainText = '';
    for (let i = 0; i < cipherText.length; i += 1) {
      if (re.test(cipherText.charAt(i))) {
        const offset =
          (cipherText.charAt(i) == cipherText.charAt(i).toUpperCase())
            ? 65
            : 97;

        plainText += String.fromCharCode(
          modulo(
            inverse * ((cipherText.charCodeAt(i) - offset) - key.beta),
            26,
          ) +
            offset,
        );
      } else {
        plainText += cipherText.charAt(i);
      }
    }
    return plainText;
  };
}
