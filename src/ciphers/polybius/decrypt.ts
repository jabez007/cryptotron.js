import { buildCipherSquare } from '@utils';

export function decrypt(key: { keyword: string; cipherChars: string }) {
  if (key.cipherChars.length !== 5) {
    throw new Error(
      `There must be exactly 5 cipher character. Received '${key.cipherChars}' for cipher characters`,
    );
  }

  const keySquare = buildCipherSquare(key.keyword);

  return (cipherText: string) => {
    let plaintext = '';
    let i = 0;
    while (i < cipherText.length) {
      if (
        key.cipherChars.indexOf(String(cipherText.charAt(i))) !== -1
      ) {
        const row = key.cipherChars.indexOf(
          String(cipherText.charAt(i)),
        );
        i += 1;
        const column = key.cipherChars.indexOf(
          String(cipherText.charAt(i)),
        );
        plaintext += keySquare[row][column];
      } else {
        plaintext += cipherText.charAt(i);
      }
      i += 1;
    }
    return plaintext;
  };
}
