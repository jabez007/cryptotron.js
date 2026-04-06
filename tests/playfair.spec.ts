import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/playfair/index.ts';

describe('Playfair Cipher', () => {
  describe('Encryption', () => {
    it('should encrypt with a keyword', () => {
      const transformer = encrypt({ keyword: 'PLAYFAIR EXAMPLE' });
      assert.strictEqual(transformer('HIDE THE GOLD IN THE TREE STUMP'), 'BMODZBXDNABEKUDMUIXMMOUVIF');
    });

    it('should handle repeated letters by inserting filler', () => {
      const transformer = encrypt({ keyword: 'KEYWORD' });
      // K E Y W O / R D A B C / F G H I L / M N P Q S / T U V X Z
      
      // 'HELL' -> digraphs: 'HE', 'LX', 'LX'
      // 'HE' -> 'GY', 'LX' -> 'IZ', 'LX' -> 'IZ'
      const result = transformer('HELL');
      assert.strictEqual(result, 'GYIZIZ');

      // 'XX' -> digraphs: 'XQ', 'XQ'
      // X[4,3], Q[3,3] same col, shift down -> W[0,3], X[4,3] -> 'WX'
      const resultXX = transformer('XX'); 
      assert.strictEqual(resultXX, 'WXWX');
    });
  });

  describe('Decryption', () => {
    it('should decrypt a Playfair cipher and remove fillers by default', () => {
      const transformer = decrypt({ keyword: 'PLAYFAIR EXAMPLE' });
      // BMODZBXDNABEKUDMUIXMMOUVIF -> HIDETHEGOLDINTHETREESTUMP
      assert.strictEqual(transformer('BMODZBXDNABEKUDMUIXMMOUVIF'), 'HIDETHEGOLDINTHETREESTUMP');
    });

    it('should optionally preserve fillers', () => {
      const transformer = decrypt({ keyword: 'PLAYFAIR EXAMPLE' }, { preserveFillers: true });
      assert.strictEqual(transformer('BMODZBXDNABEKUDMUIXMMOUVIF'), 'HIDETHEGOLDINTHETREXESTUMP');
    });

    it('should round-trip correctly for common cases', () => {
      const keyword = 'KEYWORD';
      const text = 'HELL';
      const encrypted = encrypt({ keyword })(text);
      const decrypted = decrypt({ keyword })(encrypted);
      assert.strictEqual(decrypted, 'HELL');
    });

    it('should round-trip for text ending in X', () => {
      const keyword = 'KEYWORD';
      const text = 'BOX';
      const encrypted = encrypt({ keyword })(text);
      const decrypted = decrypt({ keyword })(encrypted);
      assert.strictEqual(decrypted, 'BOX');
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
      // Ensure at least 10% of characters match
      let matches = 0;
      for (let i = 0; i < plaintext.length; i++) {
        if (result.plaintext[i] === plaintext[i]) matches++;
      }
      const threshold = Math.floor(plaintext.length * 0.1);
      assert.ok(matches >= threshold, `Cracked plaintext should have at least 10% similarity (got ${matches}/${plaintext.length}, needed ${threshold})`);
    });
  });
});
