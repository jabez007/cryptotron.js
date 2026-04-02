import assert from 'assert';
import { encrypt, decrypt, crack } from '../src/ciphers/beaufort';

describe('Beaufort', function () {
  
  describe('#encrypt', function () {
    it('should return encrypted message', function () {
      assert.strictEqual(encrypt({keyword: "foobar"})("Hello World"), "Ykdqm Vrxdy");
    });
  
    it('should handle encrypting messages multiple times', function () {
      const encryptor = encrypt({keyword: "foobar"});
      assert.strictEqual(encryptor("Lorem ipsum dolor sit amet"), "Uaxxo jqwup xduax jsy fcki");
      assert.strictEqual(encryptor("consectetuer adipiscing elit"), "dabjwpmkvhwa flgmszdgbv wgxv");
    });
  });

  describe('#decrypt', function () {
    it('should return decrypted message', function () {
      assert.strictEqual(decrypt({keyword: "foobar"})("Ykdqm Vrxdy"), "Hello World");
    });
  
    it('should handle decrypting messages multiple times', function () {
      const decryptor = decrypt({keyword: "foobar"});
      assert.strictEqual(decryptor("Uaxxo jqwup xduax jsy fcki"), "Lorem ipsum dolor sit amet");
      assert.strictEqual(decryptor("dabjwpmkvhwa flgmszdgbv wgxv"), "consectetuer adipiscing elit");
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
  });
});
