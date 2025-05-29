import { getCharOffset, modulo, re } from '@utils';

/*
 * encryption and decryption using the beaufort cipher uses exactly the same algorithm.
 */
function algorithm(keyword: string, inText: string): string {
  const cleanedKeyword = keyword.replace(/[^A-Za-z]/g, '');

  let outText = '';
  let j = 0;
  for (let i = 0; i < inText.length; i += 1) {
    const char = inText.charAt(i);

    if (re.test(char)) {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(
        cleanedKeyword.charAt(j % cleanedKeyword.length),
      );

      outText += String.fromCharCode(
        modulo(
          (cleanedKeyword.charCodeAt(j % cleanedKeyword.length) - keyOffset) -
            (inText.charCodeAt(i) - offset),
          26,
        ) + offset,
      );
      j += 1;
    } else {
      outText += char;
    }
  }
  return outText;
}

export function encrypt(key: { keyword: string }) {
  return (plainText: string) => algorithm(key.keyword, plainText);
}

export function decrypt(key: { keyword: string }) {
  return (cipherText: string) => algorithm(key.keyword, cipherText);
}
