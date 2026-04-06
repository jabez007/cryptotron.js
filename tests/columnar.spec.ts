import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/columnar/index.ts';

describe('Columnar Transposition Cipher', () => {
  describe('Encryption', () => {
    it('should encrypt with a keyword', () => {
      const transformer = encrypt({ keyword: 'CAT' });
      // C A T (2 0 1 in alphabet, but indices 0 1 2)
      // Sorted keyword: A (1), C (0), T (2)
      // HELLO -> E O (col 1), H L (col 0), L (col 2)
      assert.strictEqual(transformer('HELLO'), 'EOHLL');
    });

    it('should handle keywords with repeated characters', () => {
      const transformer = encrypt({ keyword: 'BAAA' });
      // B A A A (1 0 0 0 in alphabet, but indices 0 1 2 3)
      // Sorted: A (1), A (2), A (3), B (0)
      // HELLO -> E (1), L (2), O (3), H L (0)
      // H E L L
      // O
      // Col 0: H, O
      // Col 1: E
      // Col 2: L
      // Col 3: L
      // Order: 1, 2, 3, 0 -> E L L H O
      assert.strictEqual(transformer('HELLO'), 'ELLHO');
    });

    it('should throw error for invalid keyword', () => {
      assert.throws(() => encrypt({ keyword: '' }), /Keyword must be a non-empty string/);
      assert.throws(() => encrypt({ keyword: '123' }), /Keyword must be a non-empty string/);
    });
  });

  describe('Decryption', () => {
    it('should decrypt with a keyword', () => {
      const transformer = decrypt({ keyword: 'CAT' });
      assert.strictEqual(transformer('EOHLL'), 'HELLO');
    });

    it('should decrypt with a repeated character keyword', () => {
      const transformer = decrypt({ keyword: 'BAAA' });
      assert.strictEqual(transformer('ELLHO'), 'HELLO');
    });
  });

  describe('Cracking', () => {
    it('should crack a Columnar Transposition cipher', function() {
      this.timeout(60000);
      const plaintext = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOGTHEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
      const keyword = 'KEYWORD';
      const ciphertext = encrypt({ keyword })(plaintext);
      const result = crack(ciphertext);
      
      assert.strictEqual(result.plaintext, plaintext);
    });

    it('should handle short text for cracking', () => {
      const result = crack('A');
      assert.strictEqual(result.plaintext, 'A');
    });
  });
});
