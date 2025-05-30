import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/running-key';

describe('Running Key', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({keyText: "Lorem ipsum"})("Hello World"), "Sscpa Edjfp");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({keyText: "Lorem ipsum"})("Sscpa Edjfp"), "Hello World");
    });
  
  });
});

