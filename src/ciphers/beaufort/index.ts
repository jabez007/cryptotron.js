import { getCharOffset, modulo, transform } from '@utils';

/*
 * encryption and decryption using the beaufort cipher uses exactly the same algorithm.
 */
function algorithm(keyword: string) {
  const cleanedKeyword = keyword.replace(/[^A-Za-z]/g, '');
  if (cleanedKeyword.length < 2) {
    throw new Error(
      `Usable part of keyword must have length greater than 1. Usable part of given keyword was ${cleanedKeyword}`,
    );
  }

  let j = 0;

  return transform((char, index, text) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(
      cleanedKeyword.charAt(j % cleanedKeyword.length),
    );

    const result = String.fromCharCode(
      modulo(
        (cleanedKeyword.charCodeAt(j % cleanedKeyword.length) - keyOffset) -
          (text.charCodeAt(index) - offset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}

export function encrypt(key: { keyword: string }) {
  return algorithm(key.keyword);
}

export function decrypt(key: { keyword: string }) {
  return algorithm(key.keyword);
}
