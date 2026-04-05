/**
 * A function that transforms input text (encryption or decryption).
 */
export type CipherTransformer = (text: string) => string;

/**
 * Result of a cracking operation.
 */
export interface CrackResult<K> {
  key: K;
  plaintext: string;
}
