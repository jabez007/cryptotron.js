import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/polybius';

// Simple seeded RNG for deterministic testing
function createSeededRng(seed: number) {
  return function() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('Polybius Square', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("Hello World"), "BEBCCCCCAB EBABAECCBB");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("BEBCCCCCAB EBABAECCBB"), "hello world");
    });

    it('should preserve non-coordinate characters between coordinate pairs', function () {
      assert.strictEqual(decrypt({keyword: '', cipherChars: '12345'})("1-1 1-2"), "a- b-");
    });
  });

  describe('#crack', function () {
    this.timeout(120000);

    const educationalText = `THE POLYBIUS SQUARE, ALSO KNOWN AS THE POLYBIUS CHECKERBOARD, IS A DEVICE INVENTED BY THE ANCIENT GREEKS CLEOXENUS AND DEMOCLEITUS, AND MADE FAMOUS BY THE HISTORIAN POLYBIUS. THE DEVICE IS USED FOR FRACTIONATING PLAINTEXT CHARACTERS SO THAT THEY CAN BE REPRESENTED BY A SMALLER SET OF SYMBOLS, WHICH IS USEFUL FOR TELEGRAPHY, STEGANOGRAPHY, AND CRYPTOGRAPHY. THE DEVICE WAS ORIGINALLY USED FOR FIRE SIGNALLING, ALLOWING FOR THE OPTICAL TRANSMISSION OF ANY MESSAGE, RATHER THAN ONLY A LIMITED SET OF OPTIONS AS WAS THE CASE BEFORE. IN ITS SIMPLEST FORM, IT CONSISTS OF A FIVE BY FIVE GRID FILLED WITH THE LETTERS OF THE ALPHABET, WHERE I AND J USUALLY SHARE A SINGLE CELL TO FIT TWENTY-SIX LETTERS INTO TWENTY-FIVE SPACES.`;

    it('should recover most of the message with enough ciphertext', function () {
      const keyword = "SECRET";
      const cipherChars = "12345";
      const ciphertext = encrypt({ keyword, cipherChars })(educationalText);
      
      const rng = createSeededRng(42);
      const result = crack(ciphertext, rng);
      
      const decrypted = result.plaintext.toUpperCase();
      assert.ok(decrypted.includes("POLYBIUS"), `Expected 'POLYBIUS' in: ${decrypted}`);
      assert.ok(decrypted.includes("CHECKERBOARD"), `Expected 'CHECKERBOARD' in: ${decrypted}`);
      assert.ok(decrypted.includes("FRACTIONATING"), `Expected 'FRACTIONATING' in: ${decrypted}`);

      // Round-trip assertion
      const roundTripPlaintext = decrypt(result.key)(ciphertext);
      assert.strictEqual(roundTripPlaintext.toLowerCase(), result.plaintext.toLowerCase());
    });

    it('should handle custom cipherChars', function () {
      const keyword = "CIPHER";
      const cipherChars = "ABCDE";
      const ciphertext = encrypt({ keyword, cipherChars })(educationalText);
      
      const rng = createSeededRng(42);
      const result = crack(ciphertext, rng);
      
      const decrypted = result.plaintext.toUpperCase();
      assert.ok(decrypted.includes("POLYBIUS"), `Expected 'POLYBIUS' in: ${decrypted}`);
      assert.ok(decrypted.includes("CHECKERBOARD"), `Expected 'CHECKERBOARD' in: ${decrypted}`);
      assert.ok(decrypted.includes("FRACTIONATING"), `Expected 'FRACTIONATING' in: ${decrypted}`);
      assert.strictEqual(result.key.cipherChars, "ABCDE");

      // Round-trip assertion
      const roundTripPlaintext = decrypt(result.key)(ciphertext);
      assert.strictEqual(roundTripPlaintext.toLowerCase(), result.plaintext.toLowerCase());
    });
  });
});
