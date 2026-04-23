import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/vigenere';

describe('Vigenere', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({keyword: "foobar"})("Hello World"), "Mszmo Ntfze");
    });

    it('should handle encrypting messages multiple times', function () {
      const encryptor = encrypt({keyword: "KEY"});
      assert.strictEqual(encryptor("HELLO"), "RIJVS");
      assert.strictEqual(encryptor("HELLO"), "RIJVS");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({keyword: "foobar"})("Mszmo Ntfze"), "Hello World");
    });

    it('should handle decrypting messages multiple times', function () {
      const decryptor = decrypt({keyword: "KEY"});
      assert.strictEqual(decryptor("RIJVS"), "HELLO");
      assert.strictEqual(decryptor("RIJVS"), "HELLO");
    });
  });

  describe('#crack', function () {
    it('should recover the key and decrypt a long message', function () {
      const originalText = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT HAPPENS AGAIN";
      const keyword = "KEY";
      const ciphertext = encrypt({ keyword })(originalText);
      const result = crack(ciphertext);
      
      assert.strictEqual(result.key.keyword, keyword);
      assert.strictEqual(result.plaintext, originalText);
    });

    it('should handle longer keywords', function () {
      const originalText = "Classical cryptography is the practice and study of techniques for secure communication in the presence of adversarial behavior.";
      const keyword = "CIPHER";
      const ciphertext = encrypt({ keyword })(originalText);
      const result = crack(ciphertext);
      
      assert.strictEqual(result.key.keyword, keyword);
      assert.strictEqual(result.plaintext, originalText);
    });
  });
});
