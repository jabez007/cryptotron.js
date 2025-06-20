import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/affine';

describe('Affine', function () {
  
  describe('#encrypt', function () {
    
    it('should return encrypted message', function () {
      assert.equal(encrypt({alpha: 3, beta: 1})("Hello World"), "Wniir Praik");
    });

    it('should handle empty strings', function () {
      assert.equal(encrypt({alpha: 3, beta: 1})(""), "");
    });

    it('should preserve punctuation and spaces', function () {
      assert.equal(encrypt({alpha: 5, beta: 8})("Hello, World!"), "Rclla, Oaplx!");
    });

    it('should handle mixed case letters', function () {
      assert.equal(encrypt({alpha: 7, beta: 3})("HeLLo WoRlD"), "AfCCx BxScY");
    });

    it('should handle strings with numbers and special characters', function () {
      assert.equal(encrypt({alpha: 3, beta: 1})("Hello123@#$"), "Wniir123@#$");
    });

    it('should handle single character strings', function () {
      assert.equal(encrypt({alpha: 3, beta: 1})("A"), "B");
      assert.equal(encrypt({alpha: 3, beta: 1})("a"), "b");
    });

    it('should handle zero beta value', function () {
      assert.equal(encrypt({alpha: 3, beta: 0})("ABC"), "ADG");
    });

    it('should handle large beta values', function () {
      assert.equal(encrypt({alpha: 3, beta: 27})("A"), "B"); // 27 % 26 = 1
    });

    it('should throw error for non-integer alpha', function () {
      assert.throws(() => encrypt({alpha: 3.5, beta: 1})("Hello"), /Both key values must be integers/);
    });

    it('should throw error for non-integer beta', function () {
      assert.throws(() => encrypt({alpha: 3, beta: 1.5})("Hello"), /Both key values must be integers/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 2)', function () {
      assert.throws(() => encrypt({alpha: 2, beta: 1})("Hello"), /No inverse found for alpha value 2/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 4)', function () {
      assert.throws(() => encrypt({alpha: 4, beta: 1})("Hello"), /No inverse found for alpha value 4/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 6)', function () {
      assert.throws(() => encrypt({alpha: 6, beta: 1})("Hello"), /No inverse found for alpha value 6/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 8)', function () {
      assert.throws(() => encrypt({alpha: 8, beta: 1})("Hello"), /No inverse found for alpha value 8/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 10)', function () {
      assert.throws(() => encrypt({alpha: 10, beta: 1})("Hello"), /No inverse found for alpha value 10/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 12)', function () {
      assert.throws(() => encrypt({alpha: 12, beta: 1})("Hello"), /No inverse found for alpha value 12/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 13)', function () {
      assert.throws(() => encrypt({alpha: 13, beta: 1})("Hello"), /No inverse found for alpha value 13/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 14)', function () {
      assert.throws(() => encrypt({alpha: 14, beta: 1})("Hello"), /No inverse found for alpha value 14/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 16)', function () {
      assert.throws(() => encrypt({alpha: 16, beta: 1})("Hello"), /No inverse found for alpha value 16/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 18)', function () {
      assert.throws(() => encrypt({alpha: 18, beta: 1})("Hello"), /No inverse found for alpha value 18/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 20)', function () {
      assert.throws(() => encrypt({alpha: 20, beta: 1})("Hello"), /No inverse found for alpha value 20/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 22)', function () {
      assert.throws(() => encrypt({alpha: 22, beta: 1})("Hello"), /No inverse found for alpha value 22/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 24)', function () {
      assert.throws(() => encrypt({alpha: 24, beta: 1})("Hello"), /No inverse found for alpha value 24/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 26)', function () {
      assert.throws(() => encrypt({alpha: 26, beta: 1})("Hello"), /No inverse found for alpha value 26/);
    });

    it('should work with valid alpha values coprime with 26 (alpha = 1)', function () {
      assert.equal(encrypt({alpha: 1, beta: 1})("ABC"), "BCD");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 3)', function () {
      assert.equal(encrypt({alpha: 3, beta: 0})("ABC"), "ADG");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 5)', function () {
      assert.equal(encrypt({alpha: 5, beta: 0})("ABC"), "AFK");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 7)', function () {
      assert.equal(encrypt({alpha: 7, beta: 0})("ABC"), "AHO");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 9)', function () {
      assert.equal(encrypt({alpha: 9, beta: 0})("ABC"), "AJS");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 11)', function () {
      assert.equal(encrypt({alpha: 11, beta: 0})("ABC"), "ALW");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 15)', function () {
      assert.equal(encrypt({alpha: 15, beta: 0})("ABC"), "APE");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 17)', function () {
      assert.equal(encrypt({alpha: 17, beta: 0})("ABC"), "ARI");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 19)', function () {
      assert.equal(encrypt({alpha: 19, beta: 0})("ABC"), "ATM");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 21)', function () {
      assert.equal(encrypt({alpha: 21, beta: 0})("ABC"), "AVQ");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 23)', function () {
      assert.equal(encrypt({alpha: 23, beta: 0})("ABC"), "AXU");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 25)', function () {
      assert.equal(encrypt({alpha: 25, beta: 0})("ABC"), "AZY");
    });
  
  });

  describe('#decrypt', function () {
    
    it('should return decrypted message', function () {
      assert.equal(decrypt({alpha: 3, beta: 1})("Wniir Praik"), "Hello World");
    });

    it('should handle empty strings', function () {
      assert.equal(decrypt({alpha: 3, beta: 1})(""), "");
    });

    it('should preserve punctuation and spaces', function () {
      assert.equal(decrypt({alpha: 5, beta: 8})("Rclla, Oaplx!"), "Hello, World!");
    });

    it('should handle mixed case letters', function () {
      assert.equal(decrypt({alpha: 7, beta: 3})("AfCCx BxScY"), "HeLLo WoRlD");
    });

    it('should handle strings with numbers and special characters', function () {
      assert.equal(decrypt({alpha: 3, beta: 1})("Wniir123@#$"), "Hello123@#$");
    });

    it('should handle single character strings', function () {
      assert.equal(decrypt({alpha: 3, beta: 1})("B"), "A");
      assert.equal(decrypt({alpha: 3, beta: 1})("b"), "a");
    });

    it('should handle zero beta value', function () {
      assert.equal(decrypt({alpha: 3, beta: 0})("ADG"), "ABC");
    });

    it('should handle large beta values', function () {
      assert.equal(decrypt({alpha: 3, beta: 27})("B"), "A"); // 27 % 26 = 1
    });

    it('should throw error for non-integer alpha', function () {
      assert.throws(() => decrypt({alpha: 3.5, beta: 1})("Hello"), /Both key values must be integers/);
    });

    it('should throw error for non-integer beta', function () {
      assert.throws(() => decrypt({alpha: 3, beta: 1.5})("Hello"), /Both key values must be integers/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 2)', function () {
      assert.throws(() => decrypt({alpha: 2, beta: 1})("Hello"), /No inverse found for alpha value 2/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 4)', function () {
      assert.throws(() => decrypt({alpha: 4, beta: 1})("Hello"), /No inverse found for alpha value 4/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 6)', function () {
      assert.throws(() => decrypt({alpha: 6, beta: 1})("Hello"), /No inverse found for alpha value 6/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 8)', function () {
      assert.throws(() => decrypt({alpha: 8, beta: 1})("Hello"), /No inverse found for alpha value 8/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 10)', function () {
      assert.throws(() => decrypt({alpha: 10, beta: 1})("Hello"), /No inverse found for alpha value 10/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 12)', function () {
      assert.throws(() => decrypt({alpha: 12, beta: 1})("Hello"), /No inverse found for alpha value 12/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 13)', function () {
      assert.throws(() => decrypt({alpha: 13, beta: 1})("Hello"), /No inverse found for alpha value 13/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 14)', function () {
      assert.throws(() => decrypt({alpha: 14, beta: 1})("Hello"), /No inverse found for alpha value 14/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 16)', function () {
      assert.throws(() => decrypt({alpha: 16, beta: 1})("Hello"), /No inverse found for alpha value 16/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 18)', function () {
      assert.throws(() => decrypt({alpha: 18, beta: 1})("Hello"), /No inverse found for alpha value 18/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 20)', function () {
      assert.throws(() => decrypt({alpha: 20, beta: 1})("Hello"), /No inverse found for alpha value 20/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 22)', function () {
      assert.throws(() => decrypt({alpha: 22, beta: 1})("Hello"), /No inverse found for alpha value 22/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 24)', function () {
      assert.throws(() => decrypt({alpha: 24, beta: 1})("Hello"), /No inverse found for alpha value 24/);
    });

    it('should throw error for alpha not coprime with 26 (alpha = 26)', function () {
      assert.throws(() => decrypt({alpha: 26, beta: 1})("Hello"), /No inverse found for alpha value 26/);
    });

    it('should work with valid alpha values coprime with 26 (alpha = 1)', function () {
      assert.equal(decrypt({alpha: 1, beta: 1})("BCD"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 3)', function () {
      assert.equal(decrypt({alpha: 3, beta: 0})("ADG"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 5)', function () {
      assert.equal(decrypt({alpha: 5, beta: 0})("AFK"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 7)', function () {
      assert.equal(decrypt({alpha: 7, beta: 0})("AHO"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 9)', function () {
      assert.equal(decrypt({alpha: 9, beta: 0})("AJS"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 11)', function () {
      assert.equal(decrypt({alpha: 11, beta: 0})("ALW"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 15)', function () {
      assert.equal(decrypt({alpha: 15, beta: 0})("APE"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 17)', function () {
      assert.equal(decrypt({alpha: 17, beta: 0})("ARI"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 19)', function () {
      assert.equal(decrypt({alpha: 19, beta: 0})("ATM"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 21)', function () {
      assert.equal(decrypt({alpha: 21, beta: 0})("AVQ"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 23)', function () {
      assert.equal(decrypt({alpha: 23, beta: 0})("AXU"), "ABC");
    });

    it('should work with valid alpha values coprime with 26 (alpha = 25)', function () {
      assert.equal(decrypt({alpha: 25, beta: 0})("AZY"), "ABC");
    });
  
  });
});
