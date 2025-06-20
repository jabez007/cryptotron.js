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

    it('should handle empty strings', function () {
      assert.equal(decrypt({shift: 3})(""), "");
    });

    it('should preserve punctuation and spaces', function () {
      assert.equal(decrypt({shift: 5})("Mjqqt, Btwqi!"), "Hello, World!");
    });

    it('should handle mixed case letters', function () {
      assert.equal(decrypt({shift: 7})("OlSSV dVYSK"), "HeLLo WoRlD");
    });

    it('should handle shifts that wrap around the alphabet', function () {
      assert.equal(decrypt({shift: 25})("Gdkkn Vnqkc"), "Hello World");
    });

    it('should handle negative shifts', function () {
      assert.equal(decrypt({shift: -3})("Ebiil Tloia"), "Hello World");
    });

    it('should handle large positive shifts', function () {
      assert.equal(decrypt({shift: 29})("Khoor Zruog"), "Hello World"); // 29 % 26 = 3
    });

    it('should handle large negative shifts', function () {
      assert.equal(decrypt({shift: -29})("Ebiil Tloia"), "Hello World"); // -29 % 26 = -3
    });

    it('should handle strings with numbers and special characters', function () {
      assert.equal(decrypt({shift: 1})("Ifmmp123@#$"), "Hello123@#$");
    });

    it('should handle single character strings', function () {
      assert.equal(decrypt({shift: 1})("B"), "A");
      assert.equal(decrypt({shift: 1})("b"), "a");
    });

    it('should handle zero shift', function () {
      assert.equal(decrypt({shift: 0})("Hello World"), "Hello World");
    });
  
  });
});
