import assert from 'assert';
import { scytale } from '../src/index.ts';

describe('Scytale Cipher', function () {
  describe('#encrypt', function () {
    it('should encrypt a message with diameter 4 (user example 1)', function () {
      // Plaintext: Meet us at the park today (without spaces = 20 chars)
      // Diameter: 4
      // Expected: Mseteapoetadttrauhky
      const plaintext = 'Meetusattheparktoday';
      const encrypted = scytale.encrypt({ diameter: 4 })(plaintext);
      assert.strictEqual(encrypted.toLowerCase(), 'mseteapoetadttrauhky');
    });

    it('should encrypt with preserved casing', function () {
      // H e L l O
      // D=2, W=3.
      // H e L
      // l O
      // Col 0: H l
      // Col 1: e O
      // Col 2: L
      // Result: Hl eO L -> HleOL
      assert.strictEqual(scytale.encrypt({ diameter: 2 })('HeLlO'), 'HleOL');
    });

    it('should throw an error for invalid diameter', function () {
      assert.throws(() => scytale.encrypt({ diameter: 1 } as any));
    });
  });

  describe('#decrypt', function () {
    it('should decrypt a message with diameter 4 (user example 2)', function () {
      // Ciphertext: Iotoctydamoaneuynetx
      // Diameter: 4
      // Expected: I cannot meet you today (ignoring spaces, with padding 'x')
      const ciphertext = 'Iotoctydamoaneuynetx';
      const decrypted = scytale.decrypt({ diameter: 4 })(ciphertext);
      assert.strictEqual(decrypted.toLowerCase(), 'icannotmeetyoutodayx');
    });

    it('should round-trip correctly', function () {
      const plaintext = 'TheQuickBrownFoxJumpsOverTheLazyDog';
      const diameter = 5;
      const encrypted = scytale.encrypt({ diameter })(plaintext);
      const decrypted = scytale.decrypt({ diameter })(encrypted);
      assert.strictEqual(decrypted, plaintext);
    });
  });

  describe('#crack', function () {
    it('should recover the diameter and plaintext', function () {
      const plaintext = 'THISISASECRETNESSAGETHATWEWANTTOCONCEALFROMOTHERS';
      const ciphertext = scytale.encrypt({ diameter: 6 })(plaintext);
      const result = scytale.crack(ciphertext);
      
      assert.strictEqual(result.key.diameter, 6);
      assert.strictEqual(result.plaintext, plaintext);
    });
  });
});
