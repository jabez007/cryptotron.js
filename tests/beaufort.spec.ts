import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/beaufort';

describe('Beaufort', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({keyword: "foobar"})("Hello World"), "Ykdqm Vrxdy");
    });
  
    it('should handle encrypting messages multiple times', function () {
      const encryptor = encrypt({keyword: "foobar"})

      assert.equal(encryptor("Lorem ipsum dolor sit amet"), "Uaxxo jqwup xduax jsy fcki");
      assert.equal(encryptor("consectetuer adipiscing elit"), "dabjwpmkvhwa flgmszdgbv wgxv");
    });

  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({keyword: "foobar"})("Ykdqm Vrxdy"), "Hello World");
    });
  
    it('should handle decrypting messages multiple times', function () {
      const decryptor = decrypt({keyword: "foobar"})

      assert.equal(decryptor("Uaxxo jqwup xduax jsy fcki"), "Lorem ipsum dolor sit amet");
      assert.equal(decryptor("dabjwpmkvhwa flgmszdgbv wgxv"), "consectetuer adipiscing elit");
    });

  });
});

