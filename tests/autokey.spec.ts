import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/autokey';

describe('Autokey', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({primer: "foobar"})("Hello World"), "Mszmo Nvvwo");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({primer: "foobar"})("Mszmo Nvvwo"), "Hello World");
    });
  
  });
});

