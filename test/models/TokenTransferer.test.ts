import { assert } from 'chai';
import nock from 'nock';
import { BigNumber, ethers } from 'ethers';
import { TokenTransferer } from '../../models/TokenTransferer';
import { bn } from '../../helpers/utils';

describe('TokenTransferer', function () {
  var transferer: TokenTransferer;

  beforeEach(function () {
    transferer = new TokenTransferer(
      'ETH',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      process.env.NEXT_TENDERLY_MAINNET_FORK!
    );

    nock.back.fixtures = __dirname + '/fixtures/TokenTransferer';
    nock.back.setMode('record');
  });

  describe('#formatAmount', function () {
    it('should transfer amount and expand it by the right token decimals', async function () {
      const { nockDone, context } = await nock.back('formatAmount.json');
      let info = await transferer.formatAmount('123');
      assert.deepEqual(info, bn('123000000000000000000'));
      nockDone();
    });
  });

  describe('#findHolder', function () {
    it('should find a holder with enough tokens', async function () {
      const { nockDone, context } = await nock.back('findHolder.json');
      let info = await transferer.findHolder(bn('123000000000000000000'));
      assert.deepEqual(info, {
        status: 'success',
        holder: '0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe',
      });
      nockDone();
    });

    it('should return an error if no holder has enough tokens', async function () {
      const { nockDone, context } = await nock.back('findHolderError.json');
      let info = await transferer.findHolder(bn('123000000000000000000000000000'));
      assert.deepEqual(info, {
        status: 'error',
        holder: undefined,
        msg: 'Cannot find an address with enough tokens.',
      });
      nockDone();
    });
  });
});
