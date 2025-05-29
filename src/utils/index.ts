export const re = /[A-Za-z]/;

export function getCharOffset(val: string) {
  if (val.length !== 1) {
    throw new Error('Length of input value must be 1');
  }

  return (val.charAt(0) == val.charAt(0).toUpperCase()) ? 65 : 97;
}

export function modulo(n: number, m: number): number {
  if (!(Number.isInteger(n) && Number.isInteger(m))) {
    throw new Error('Both input values must be integers');
  }

  return ((n % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  if (!(Number.isInteger(a) && Number.isInteger(b))) {
    throw new Error('Both input values must be integers');
  }

  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}
