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
      let keyText = "";
      while (keyText.length < originalText.length) {
        keyText += keyword;
      }
      keyText = keyText.substring(0, originalText.length);

      const ciphertext = encrypt({ keyText })(originalText);
      const result = crack(ciphertext);
      
      assert.strictEqual(result.plaintext, originalText);
    });
  });
});
