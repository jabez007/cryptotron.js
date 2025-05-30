import { getCharOffset, modulo, transform } from '@utils';

export function decrypt(key: { keyword: string }) {
  const cleanedKeyword = key.keyword.replace(/[^A-Za-z]/g, '');

  let j = 0;
  return transform((char, index, cipher) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const _j = j % cleanedKeyword.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(cleanedKeyword.charAt(_j));

    const result = String.fromCharCode(
      modulo(
        (cipher.charCodeAt(index) - offset) -
          (cleanedKeyword.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
