import { getCharOffset, modulo, transform } from '@utils';

export function encrypt(key: { keyText: string }) {
  const cleanedKeyText = key.keyText.replace(/[^A-Za-z]/g, '');

  return (plainText: string) => {
    const cleanedPlainText = plainText.replace(/[^A-Za-z]/g, '');
    if (cleanedPlainText.length > cleanedKeyText.length) {
      throw new Error(
        `Usable key text must be at least as long as encryptable plain text. Usable key was ${cleanedKeyText.length} characters long while encryptable plain text was ${cleanedPlainText.length} characters long`,
      );
    }

    let j = 0;

    return transform((char, index, plain) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(cleanedKeyText.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (plain.charCodeAt(index) - offset) +
            (cleanedKeyText.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(plainText);
  };
}
