import { getCharOffset, modulo, re } from '@utils';

export function encrypt(key: { shift: number }) {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Shift key value must be an integer');
  }

  return (plainText: string): string => {
    let cipherText = '';
    for (let i = 0; i < plainText.length; i += 1) {
      const char = plainText.charAt(i);

      if (re.test(char)) {
        const offset = getCharOffset(char);

        cipherText += String.fromCharCode(
          modulo((plainText.charCodeAt(i) - offset) + key.shift, 26) + offset,
        );
      } else {
        cipherText += plainText.charAt(i);
      }
    }
    return cipherText;
  };
}
