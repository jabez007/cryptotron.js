import assert from 'assert';
import { encrypt, decrypt } from '../src/ciphers/hill';

describe('Hill', function () {
  describe('#encrypt', function () {
    it('should encrypt using a 2x2 matrix', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(encrypt({ matrix })('HELP'), 'HIAT');
    });

    it('should encrypt using a 3x3 matrix', function () {
      const matrix = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];
      assert.strictEqual(encrypt({ matrix })('ACT'), 'POH');
    });

    it('should encrypt using a keyword', function () {
      assert.strictEqual(encrypt({ keyword: 'DDCF' })('HELP'), 'HIAT');
    });

    it('should preserve non-alphabetic characters', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(encrypt({ matrix })('HE LP'), 'HI AT');
    });

    it('should pad with X if message length is not a multiple of matrix size', function () {
      const matrix = [[3, 3], [2, 5]];
      // 'HEL' -> 'HE' 'LX'
      // 'HE' -> 'HI'
      // 'LX' -> [11, 23]
      // [3, 3] * [11, 23] = 33 + 69 = 102 mod 26 = 24 (Y)
      // [2, 5] * [11, 23] = 22 + 115 = 137 mod 26 = 7 (H)
      assert.strictEqual(encrypt({ matrix })('HEL'), 'HIYH');
    });

    it('should handle mixed case', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(encrypt({ matrix })('HeLp'), 'HiAt');
    });

    it('should throw error for non-invertible matrix', function () {
      const matrix = [[2, 2], [2, 2]]; // Determinant 0
      assert.throws(() => encrypt({ matrix }), /Matrix is not invertible/);
    });

    it('should throw error for invalid keyword length', function () {
      assert.throws(() => encrypt({ keyword: 'ABC' }), /Keyword length must be a non-zero perfect square/);
    });
  });

  describe('#decrypt', function () {
    it('should decrypt using a 2x2 matrix', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(decrypt({ matrix })('HIAT'), 'HELP');
    });

    it('should decrypt using a 3x3 matrix', function () {
      const matrix = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];
      assert.strictEqual(decrypt({ matrix })('POH'), 'ACT');
    });

    it('should decrypt using a keyword', function () {
      assert.strictEqual(decrypt({ keyword: 'DDCF' })('HIAT'), 'HELP');
    });

    it('should preserve non-alphabetic characters', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(decrypt({ matrix })('HI AT'), 'HE LP');
    });

    it('should handle mixed case', function () {
      const matrix = [[3, 3], [2, 5]];
      assert.strictEqual(decrypt({ matrix })('HiAt'), 'HeLp');
    });
  });

  describe('Roundtrip', function () {
    it('should work for long messages with mixed characters', function () {
      const matrix = [[3, 3], [2, 5]];
      const message = 'The Hill cipher is a polygraphic substitution cipher.';
      const encrypted = encrypt({ matrix })(message);
      const decrypted = decrypt({ matrix })(encrypted);
      // Note: Decrypted might have extra 'X' at the end due to padding if the number of letters was odd
      assert.ok(decrypted.startsWith(message));
    });
  });
});
