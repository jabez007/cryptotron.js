import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/substitution';

// Simple seeded RNG for deterministic testing
function createSeededRng(seed: number) {
  return function() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('Substitution', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({cipherAlphabet: 'qwertyuiopasdfghjklzxcvbnm'})("Hello World"), "Itssg Vgksr");
    });

    it('should throw error for non-unique cipherAlphabet', function () {
      assert.throws(() => encrypt({cipherAlphabet: 'aaertyuiopasdfghjklzxcvbnm'}), /Cipher alphabet must be exactly 26 unique characters/);
    });

    it('should throw error for cipherAlphabet with length !== 26', function () {
      assert.throws(() => encrypt({cipherAlphabet: 'qwerty'}), /Cipher alphabet must be exactly 26 unique characters/);
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({cipherAlphabet: 'qwertyuiopasdfghjklzxcvbnm'})("Itssg Vgksr"), "Hello World");
    });

    it('should throw error for non-unique cipherAlphabet', function () {
      assert.throws(() => decrypt({cipherAlphabet: 'aaertyuiopasdfghjklzxcvbnm'}), /Cipher alphabet must be exactly 26 unique characters/);
    });

    it('should throw error for cipherAlphabet with length !== 26', function () {
      assert.throws(() => decrypt({cipherAlphabet: 'qwerty'}), /Cipher alphabet must be exactly 26 unique characters/);
    });
  });

  describe('#crack', function () {
    this.timeout(60000);

    it('should recover most of the message with enough ciphertext', function () {
      const originalText = `THE SIMPLE SUBSTITUTION CIPHER IS A METHOD OF ENCRYPTION BY WHICH UNITS OF PLAINTEXT ARE REPLACED WITH CIPHERTEXT, ACCORDING TO A FIXED SYSTEM; THE UNITS MAY BE SINGLE LETTERS, PAIRS OF LETTERS, TRIPLETS OF LETTERS, MIXTURES OF THE ABOVE, AND SO FORTH. THE RECEIVER DECIPHERS THE TEXT BY PERFORMING THE INVERSE SUBSTITUTION. SUBSTITUTION CIPHERS CAN BE COMPARED WITH TRANSPOSITION CIPHERS. IN A TRANSPOSITION CIPHER, THE UNITS OF THE PLAINTEXT ARE REARRANGED IN A DIFFERENT AND USUALLY QUITE COMPLEX ORDER, BUT THE UNITS THEMSELVES ARE LEFT UNCHANGED. BY CONTRAST, IN A SUBSTITUTION CIPHER, THE UNITS OF THE PLAINTEXT ARE RETAINED IN THE SAME SEQUENCE IN THE CIPHERTEXT, BUT THE UNITS THEMSELVES ARE ALTERED.`;
      const cipherAlphabet = "PHQGIUMEAYLNFJKRZVSOXDTBCW";
      const ciphertext = encrypt({ cipherAlphabet })(originalText);
      
      // Use a seeded RNG for deterministic results
      const rng = createSeededRng(42);
      const result = crack(ciphertext, 10, 15000, rng);
      
      const decrypted = result.plaintext.toUpperCase();
      assert.ok(decrypted.includes("SUBSTITUTION"), `Expected 'SUBSTITUTION' in: ${decrypted}`);
      assert.ok(decrypted.includes("TRANSPOSITION"), `Expected 'TRANSPOSITION' in: ${decrypted}`);
      assert.ok(decrypted.includes("CIPHERTEXT"), `Expected 'CIPHERTEXT' in: ${decrypted}`);
    });
  });
});
