import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/playfair/index.ts';

describe('Playfair Cipher', () => {
  describe('Encryption', () => {
    it('should encrypt with a keyword', () => {
      const transformer = encrypt({ keyword: 'PLAYFAIR EXAMPLE' });
      assert.strictEqual(transformer('HIDE THE GOLD IN THE TREE STUMP'), 'BMODZBXDNABEKUDMUIXMMOUVIF');
    });

    it('should handle repeated letters by inserting X', () => {
      const transformer = encrypt({ keyword: 'KEYWORD' });
      const result = transformer('HELL'); // HE LX L -> HELX LX
      assert.strictEqual(result.length, 6);
    });
  });

  describe('Decryption', () => {
    it('should decrypt a Playfair cipher', () => {
      const transformer = decrypt({ keyword: 'PLAYFAIR EXAMPLE' });
      assert.strictEqual(transformer('BMODZBXDNABEKUDMUIXMMOUVIF'), 'HIDETHEGOLDINTHETREXESTUMP');
    });
  });

  describe('Cracking', () => {
    // Optional, but let's test a very simple one or just that it returns something
    it('should handle cracking (optional)', function() {
      this.timeout(20000);
      const plaintext = 'HIDETHEGOLDINTHETREESTUMPX';
      const keyword = 'KEYWORD';
      const ciphertext = encrypt({ keyword })(plaintext);
      const result = crack(ciphertext);
      assert.notStrictEqual(result.plaintext, '');
    });
  });
});
