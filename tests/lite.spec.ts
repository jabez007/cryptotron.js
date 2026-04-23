import assert from 'node:assert';
import { loadNgramData, setNgramData, getScorer, Scorer } from '../src/utils/cryptanalysis';
import { STATIC_NGRAMS } from '../src/utils/ngram-data-static';

describe('Lite Version & Dynamic Loading', function () {
  
  beforeEach(function () {
    // Clear data before each test to ensure we're testing the "lite" state
    setNgramData('trigrams', {});
    setNgramData('quadgrams', {});
  });

  after(function () {
    // Restore data after all lite tests to not break other tests
    setNgramData('trigrams', STATIC_NGRAMS.trigrams);
    setNgramData('quadgrams', STATIC_NGRAMS.quadgrams);
  });

  it('should allow manually setting and clearing n-gram data', function () {
    const testData = { 'ABCD': 100 };
    setNgramData('quadgrams', testData);
    
    const scorer = new Scorer('quadgrams');
    assert.strictEqual(scorer.score('ABCD'), 0); // log10(100/100) = 0
    
    setNgramData('quadgrams', {});
    assert.throws(() => new Scorer('quadgrams'), {
      message: /Total n-gram count is 0/
    });
  });

  it('should dynamically load trigram data', async function () {
    // We can only test this if it's not already loaded, but we don't have an easy way to unload.
    // So we test that loadNgramData(3) makes getScorer(3) work.
    setNgramData('trigrams', {});
    await loadNgramData(3);
    const scorer = getScorer(3);
    assert.ok(scorer);
    assert.ok(scorer.score('THE') > scorer.score('XYZ'));
  });

  it('should dynamically load quadgram data', async function () {
    setNgramData('quadgrams', {});
    await loadNgramData(4);
    const scorer = getScorer(4);
    assert.ok(scorer);
    assert.ok(scorer.score('TION') > scorer.score('QXWZ'));
  });

  it('should return immediately for n=1 or n=2 in loadNgramData', async function () {
    await loadNgramData(1);
    await loadNgramData(2);
    // Should not throw
  });

  it('should throw error for invalid n-gram length in loadNgramData', async function () {
    await assert.rejects(() => loadNgramData(0), {
      name: 'RangeError',
      message: /Must be between 1 and 4/
    });
    await assert.rejects(() => loadNgramData(5), {
      name: 'RangeError',
      message: /Must be between 1 and 4/
    });
  });
});
