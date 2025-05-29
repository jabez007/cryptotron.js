import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/beaufort';

describe('Beaufort', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({keyword: "foobar"})("Hello World"), "Ykdqm Vrxdy");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({keyword: "foobar"})("Ykdqm Vrxdy"), "Hello World");
    });
  
  });
});

