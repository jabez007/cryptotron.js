import { alphaLower, getUniqueCharacters, transform } from '@utils';

export function decrypt(key: { cipherAlphabet: string }) {
  const plainAlphabet = alphaLower;

  const cipherAlphabet = getUniqueCharacters(
    `${key.cipherAlphabet.toLowerCase()}${plainAlphabet}`,
  );

  return transform((char) => {
    const pos = cipherAlphabet.indexOf(char.toLowerCase());

    if (char.toUpperCase() === char) {
      return plainAlphabet[pos].toUpperCase();
    }

    return plainAlphabet[pos];
  });
}
