import { buildCipherSquare, transform } from '@utils';

export function encrypt(key: { keyword: string; cipherChars: string }) {
  if (key.cipherChars.length !== 5) {
    throw new Error(
      `There must be exactly 5 cipher character. Received '${key.cipherChars}' for cipher characters`,
    );
  }

  const keySquare = buildCipherSquare(key.keyword);

  return (plainText: string) => {
    const plaintext = plainText.toLowerCase().replace(/[j]/g, 'i');

    return transform((char) => {
      const row = keySquare.findIndex((r) => r.includes(char));
      const column = keySquare[row].findIndex((c) => c === char);
      return `${key.cipherChars.charAt(row)}${key.cipherChars.charAt(column)}`;
    })(plaintext);
  };
}
