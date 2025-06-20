import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/polybius'

describe('Polybius Square', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("Hello World"), "BEBCCCCCAB EBABAECCBB");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({keyword: 'foobar', cipherChars: 'ABCDE'})("BEBCCCCCAB EBABAECCBB"), "hello world");
    });
  
  });
});

