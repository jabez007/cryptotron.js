import { getCharOffset, modulo, transform } from '@utils';

export function decrypt(key: { keyText: string }) {
  const cleanedKeyText = key.keyText.replace(/[^A-Za-z]/g, '');

  return (cipherText: string) => {
    const cleanedCipherText = cipherText.replace(/[^A-Za-z]/g, '');
    if (cleanedCipherText.length > cleanedKeyText.length) {
      throw new Error(
        `Usable key text must be at least as long as decryptable cipher text. Usable key was ${cleanedKeyText.length} characters long while encryptable plain text was ${cleanedCipherText.length} characters long`,
      );
    }

    let j = 0;

    return transform((char, index, cipher) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(cleanedKeyText.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (cipher.charCodeAt(index) - offset) -
            (cleanedKeyText.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(cipherText);
  };
}
