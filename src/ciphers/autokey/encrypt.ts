import { getCharOffset, modulo, transform } from '@utils';

export function encrypt(key: { primer: string }) {
  return (plainText: string): string => {
    const autokey = `${key.primer}${plainText}`.replace(/[^A-Za-z]/g, '');

    let j = 0;

    return transform((char, index, plain) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(autokey.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (plain.charCodeAt(index) - offset) +
            (autokey.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(plainText);
  };
}
