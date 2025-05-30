import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/substitution'

describe('Substitution', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({cipherAlphabet: 'qwertyuiopasdfghjklzxcvbnm'})("Hello World"), "Itssg Vgksr");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({cipherAlphabet: 'qwertyuiopasdfghjklzxcvbnm'})("Itssg Vgksr"), "Hello World");
    });
  
  });
});

