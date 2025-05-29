import { getCharOffset, modulo, transform } from '@utils';

export function encrypt(key: { alpha: number; beta: number }) {
  if (!(Number.isInteger(key.alpha) && Number.isInteger(key.beta))) {
    throw new Error('Both key values must be integers');
  }

  return transform((char, index, plain) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(key.alpha * (plain.charCodeAt(index) - offset) + key.beta, 26) +
        offset,
    );
  });
}
