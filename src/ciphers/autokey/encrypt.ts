import { getCharOffset, modulo, re } from '@utils';

export function encrypt(key: { primer: string }) {
  return (plainText: string): string => {
    const autokey = `${key.primer}${plainText}`.replace(/[^A-Za-z]/g, '');

    let cipherText = '';
    let j = 0;
    for (let i = 0; i < plainText.length; i += 1) {
      const char = plainText.charAt(i);

      if (re.test(char)) {
        const offset = getCharOffset(char);
        const keyOffset = getCharOffset(autokey.charAt(j));

        cipherText += String.fromCharCode(
          modulo(
            (plainText.charCodeAt(i) - offset) +
              (autokey.charCodeAt(j) - keyOffset),
            26,
          ) + offset,
        );
        j += 1;
      } else {
        cipherText += char;
      }
    }
    return cipherText;
  };
}
