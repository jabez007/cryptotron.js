import assert from 'assert';
import { caesar } from '../src/index';

describe('Main', function () {
  
  describe('#caesar', function () {
    
    it('should return encrypted message', function () {
      assert.equal(caesar.encrypt({shift: 3})("Hello World"), "Khoor Zruog");
    });

    it('should return decrypted message', function () {
      assert.equal(caesar.decrypt({shift: 3})("Khoor Zruog"), "Hello World");
    });

  });

});
