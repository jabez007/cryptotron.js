import { modulo, re } from '@utils';

export function encrypt(key: { alpha: number; beta: number }) {
  if (!(Number.isInteger(key.alpha) && Number.isInteger(key.beta))) {
    throw new Error('Both key values must be integers');
  }

  return (plainText: string) => {
    let cipherText = '';
    for (let i = 0; i < plainText.length; i += 1) {
      if (re.test(plainText.charAt(i))) {
        const offset =
          (plainText.charAt(i) == plainText.charAt(i).toUpperCase()) ? 65 : 97;

        cipherText += String.fromCharCode(
          modulo(
            key.alpha * (plainText.charCodeAt(i) - offset) + key.beta,
            26,
          ) +
            offset,
        );
      } else {
        cipherText += plainText.charAt(i);
      }
    }
    return cipherText;
  };
}
