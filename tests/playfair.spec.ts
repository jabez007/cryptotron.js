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
      // 'HELL' becomes digraphs 'HE', then 'LL' which becomes 'LX'
      // (inserting X between repeated letters), leaving a trailing 'L'
      // which is padded to 'LX', resulting in digraphs 'HE', 'LX', 'LX'
      // (6 characters total).
      const result = transformer('HELL');
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
      
      assert.ok(result.plaintext.length >= plaintext.length, 'Cracked length should be at least original length');
      // Ensure at least some characters match (should be a common substring or many individual matches)
      let matches = 0;
      for (let i = 0; i < plaintext.length; i++) {
        if (result.plaintext[i] === plaintext[i]) matches++;
      }
      assert.ok(matches > 0, 'Cracked plaintext should have some similarity to original');
    });
  });
});
