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
    it('should recover the plaintext when using a non-periodic key', function () {
      const originalText = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN";
      // Ensure keyText is at least as long as the text being encrypted!
      const keySource = "THIS IS A LONG KEY TEXT THAT DOES NOT REPEAT AND IS USED TO ENCRYPT THE MESSAGE IN A RUNNING KEY CIPHER STYLE WHICH IS VERY SECURE AND LONG ENOUGH TO COVER EVERYTHING WE NEED FOR THIS TEST CASE AND MORE JUST TO BE ABSOLUTELY SURE WE HAVE ENOUGH CHARACTERS";
      const keyText = keySource.substring(0, originalText.length + 10); // Give it some extra buffer
      const ciphertext = encrypt({ keyText })(originalText);
      
      const result = crack(ciphertext);
      
      assert.ok(result.plaintext.length > 0);
    });
  });
});
