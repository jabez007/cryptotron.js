import assert from 'assert';
import { modulo, gcd } from '../src/utils/index';

describe('modulo', function() {

  it('should return the same number when less than the modulo', function () {
    assert.equal(modulo(5, 12), 5);
  });

  it('should return the base number when greater than the modulo', function () {
    assert.equal(modulo(17, 12), 5);
  });

  it('should thow an error if non-integer values are used for inputs', function () {
    assert.throws(function () {
      modulo(5.2, 12)
    });
    assert.throws(function () {
      modulo(5, 12.3)
    });
    assert.throws(function () {
      modulo(5.2, 12.3)
    });
  });

})

describe('gcd', function () {
  
  it('should return 1 when inputs are co-prime', function () {
    assert.equal(gcd(17, 19), 1);
  });

  it('should return something other than 1 when inputs are not co-prime', function () {
    assert.notEqual(gcd(17, 51), 1);
  });

  it('should return same value no matter the order of the inputs', function () {
    assert.equal(gcd(34, 38), gcd(38, 34));
  });

  it('should thow an error if non-integer values are used for inputs', function () {
    assert.throws(function () {
      gcd(2.1, 3)
    });
    assert.throws(function () {
      gcd(2, 3.2)
    });
    assert.throws(function () {
      gcd(2.1, 3.2)
    });
  });

});

