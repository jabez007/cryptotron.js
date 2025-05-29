import { getCharOffset, modulo, transform } from '@utils';

export function encrypt(key: { shift: number }) {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Shift key value must be an integer');
  }

  return transform((char, index, plain) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo((plain.charCodeAt(index) - offset) + key.shift, 26) + offset,
    );
  });
}
