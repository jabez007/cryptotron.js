import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/affine';

describe('Affine', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({alpha: 3, beta: 1})("Hello World"), "Wniir Praik");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({alpha: 3, beta: 1})("Wniir Praik"), "Hello World");
    });
  
  });
});

