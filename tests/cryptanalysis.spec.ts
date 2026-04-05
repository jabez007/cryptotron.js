import assert from 'node:assert';
import { getScorer } from '../src/utils/cryptanalysis';

describe('Cryptanalysis Utilities', function () {
  describe('#getScorer', function () {
    it('should return a scorer for valid n values', function () {
      assert.ok(getScorer(1));
      assert.ok(getScorer(2));
      assert.ok(getScorer(3));
      assert.ok(getScorer(4));
    });

    it('should throw TypeError for invalid numeric types', function () {
      // Non-finite
      assert.throws(() => getScorer(Infinity), {
        name: 'TypeError',
        message: /Invalid n-gram length/
      });
      assert.throws(() => getScorer(NaN), {
        name: 'TypeError',
        message: /Invalid n-gram length/
      });

      // Non-integer
      assert.throws(() => getScorer(1.5), {
        name: 'TypeError',
        message: /Invalid n-gram length/
      });
    });

    it('should throw RangeError for values out of range [1, 4]', function () {
      assert.throws(() => getScorer(0), {
        name: 'RangeError',
        message: /Must be between 1 and 4/
      });
      assert.throws(() => getScorer(5), {
        name: 'RangeError',
        message: /Must be between 1 and 4/
      });
      assert.throws(() => getScorer(-1), {
        name: 'RangeError',
        message: /Must be between 1 and 4/
      });
    });
  });
});
