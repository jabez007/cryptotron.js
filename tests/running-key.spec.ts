import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/running-key';

describe('Running Key', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({keyText: "Lorem ipsum"})("Hello World"), "Sscpa Edjfp");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({keyText: "Lorem ipsum"})("Sscpa Edjfp"), "Hello World");
    });
  });

  describe('#crack', function () {
    it('should recover the plaintext when assuming a repeating keyword', function () {
      const originalText = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN";
      const keyword = "KEY";
      
      // Compute the normalized alphabetic length to match decrypt behavior
      const alphabeticLength = originalText.replace(/[^A-Za-z]/g, '').length;
      let keyText = "";
      while (keyText.length < alphabeticLength) {
        keyText += keyword;
      }
      keyText = keyText.substring(0, alphabeticLength);

      const ciphertext = encrypt({ keyText })(originalText);
      const result = crack(ciphertext);
      
      // Robust semantic recovery check (ignore case and non-letters)
      const normalize = (text: string) => text.toUpperCase().replace(/[^A-Z]/g, '');
      assert.strictEqual(normalize(result.plaintext), normalize(originalText));
      
      // Also verify keyText construction matches assuming repeating keyword
      assert.strictEqual(result.key.keyText.length, alphabeticLength);
      assert.strictEqual(result.key.type, 'repeating-key');
    });
  });
});
