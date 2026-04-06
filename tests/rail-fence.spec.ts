import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/rail-fence/index.ts';

describe('Rail-Fence Cipher', () => {
  describe('Encryption', () => {
    it('should encrypt with 2 rails', () => {
      const transformer = encrypt({ rails: 2 });
      assert.strictEqual(transformer('HELLO'), 'HLOEL');
    });

    it('should encrypt with 3 rails', () => {
      const transformer = encrypt({ rails: 3 });
      assert.strictEqual(transformer('HELLO'), 'HOELL');
    });

    it('should encrypt with 4 rails', () => {
      const transformer = encrypt({ rails: 4 });
      assert.strictEqual(transformer('HELLO'), 'HELOL');
    });

    it('should return original text if rails >= text length', () => {
      assert.strictEqual(encrypt({ rails: 10 })('HELLO'), 'HELLO');
    });

    it('should throw error for invalid rails', () => {
      assert.throws(() => encrypt({ rails: 1 }), /Rails must be an integer greater than or equal to 2/);
      assert.throws(() => encrypt({ rails: 2.5 } as unknown as { rails: number }), /Rails must be an integer greater than or equal to 2/);
    });
  });

  describe('Decryption', () => {
    it('should decrypt with 2 rails', () => {
      const transformer = decrypt({ rails: 2 });
      assert.strictEqual(transformer('HLOEL'), 'HELLO');
    });

    it('should decrypt with 3 rails', () => {
      const transformer = decrypt({ rails: 3 });
      assert.strictEqual(transformer('HOELL'), 'HELLO');
    });

    it('should decrypt with 4 rails', () => {
      const transformer = decrypt({ rails: 4 });
      assert.strictEqual(transformer('HELOL'), 'HELLO');
    });

    it('should return original text if rails >= text length', () => {
      assert.strictEqual(decrypt({ rails: 10 })('HELLO'), 'HELLO');
    });
  });

  describe('Cracking', () => {
    it('should crack a simple Rail-Fence cipher', () => {
      const plaintext = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
      const ciphertext = encrypt({ rails: 3 })(plaintext);
      const result = crack(ciphertext);
      assert.strictEqual(result.key.rails, 3);
      assert.strictEqual(result.plaintext, plaintext);
    });

    it('should handle short text for cracking', () => {
      const result = crack('A');
      assert.strictEqual(result.plaintext, 'A');
    });
  });
});
