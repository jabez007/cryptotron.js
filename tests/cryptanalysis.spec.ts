import assert from 'node:assert';
import { getScorer } from '../src/utils/cryptanalysis.ts';

describe('Cryptanalysis Utilities', function () {
  describe('#getScorer', function () {
    it('should return a scorer for valid n values', function () {
      assert.ok(getScorer(1));
      assert.ok(getScorer(2));
      assert.ok(getScorer(3));
      assert.ok(getScorer(4));
    });

    it('should throw TypeError for invalid n values', function () {
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

      // Out of domain
      assert.throws(() => getScorer(0), {
        name: 'TypeError',
        message: /Invalid n-gram length/
      });
      assert.throws(() => getScorer(-1), {
        name: 'TypeError',
        message: /Invalid n-gram length/
      });
    });
  });
});
