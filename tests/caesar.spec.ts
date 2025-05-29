import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/caesar';

describe('Caesar', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({shift: 3})("Hello World"), "Khoor Zruog");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({shift: 3})("Khoor Zruog"), "Hello World");
    });
  
  });
});

