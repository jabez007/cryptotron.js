import { getCharOffset, modulo, re } from '@utils';

export function decrypt(key: { shift: number }) {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Shift key value must be an integer');
  }

  return (cipherText: string): string => {
    let plainText = '';
    for (let i = 0; i < cipherText.length; i += 1) {
      const char = cipherText.charAt(i);

      if (re.test(char)) {
        const offset = getCharOffset(char);

        plainText += String.fromCharCode(
          modulo((cipherText.charCodeAt(i) - offset) - key.shift, 26) + offset,
        );
      } else {
        plainText += char;
      }
    }
    return plainText;
  };
}
