import { getCharOffset, modulo, re } from '@utils';

export function decrypt(key: { primer: string }) {
  return (cipherText: string): string => {
    let autokey = key.primer.replace(/[^A-Za-z]/g, '');

    let plainText = '';
    let j = 0;
    for (let i = 0; i < cipherText.length; i += 1) {
      const char = cipherText.charAt(i);

      if (re.test(char)) {
        const offset = getCharOffset(char);
        const keyOffset = getCharOffset(autokey.charAt(j));

        const plainchar = String.fromCharCode(
          modulo(
            (cipherText.charCodeAt(i) - offset) -
              (autokey.charCodeAt(j) - keyOffset),
            26,
          ) + offset,
        );
        plainText += plainchar;
        autokey += plainchar;
        j += 1;
      } else {
        plainText += cipherText.charAt(i);
      }
    }
    return plainText;
  };
}
