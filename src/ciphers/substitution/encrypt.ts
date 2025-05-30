import { alphaLower, getUniqueCharacters, transform } from '@utils';

export function encrypt(key: { cipherAlphabet: string }) {
  const plainAlphabet = alphaLower;

  const cipherAlphabet = getUniqueCharacters(
    `${key.cipherAlphabet.toLowerCase()}${plainAlphabet}`,
  );

  return transform((char) => {
    const pos = plainAlphabet.indexOf(char.toLowerCase());

    if (char.toUpperCase() === char) {
      return cipherAlphabet[pos].toUpperCase();
    }

    return cipherAlphabet[pos];
  });
}
