import { getCharOffset, modulo, transform } from '@utils';

export function decrypt(key: { primer: string }) {
  return (cipherText: string): string => {
    let autokey = key.primer.replace(/[^A-Za-z]/g, '');

    let j = 0;

    return transform((char, index, cipher) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(autokey.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (cipher.charCodeAt(index) - offset) -
            (autokey.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      autokey += result;
      j += 1;

      return result;
    })(cipherText);
  };
}
