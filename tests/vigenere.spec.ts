import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/vigenere';

describe('Vigenere', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({keyword: "foobar"})("Hello World"), "Mszmo Ntfze");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({keyword: "foobar"})("Mszmo Ntfze"), "Hello World");
    });
  
  });
});

