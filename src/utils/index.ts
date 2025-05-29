export const re = /[A-Za-z]/;

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
