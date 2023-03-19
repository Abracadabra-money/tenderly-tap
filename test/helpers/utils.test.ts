import { assert } from 'chai';
import { BigNumber } from 'ethers';
import * as utils from '../../helpers/utils';

describe('.bnToFloat', function () {
  it('should convert a BigNumber to a float', function () {
    const bn = BigNumber.from('1500000000000000000');
    const decimal = 18;
    const result = utils.bnToFloat(bn, decimal);
    assert.equal(result, 1.5);
  });

  it('should return a float from a BigNumber', () => {
    assert.equal(utils.bnToFloat(BigNumber.from(1234), 3), 1.234);
  });
});

describe('.expandDecimals', () => {
  it('returns Math.pow(10, x)', () => {
    assert.deepEqual(utils.expandDecimals(1), BigNumber.from(10));
    assert.deepEqual(utils.expandDecimals(0), BigNumber.from(1));
  });
});
