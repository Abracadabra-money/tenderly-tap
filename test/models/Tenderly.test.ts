import { assert } from 'chai';
import nock from 'nock';
import { ethers } from 'ethers';
import { Tenderly } from '../../models/Tenderly';

describe('Tenderly', function () {
  var tenderly: Tenderly;
  beforeEach(function () {
    tenderly = new Tenderly(process.env.NEXT_TENDERLY_MAINNET_FORK!);

    nock.back.fixtures = __dirname + '/fixtures/Tenderly';
    nock.back.setMode('record');
  });

  describe('#getForkInfo', function () {
    it('should get information about the fork', async function () {
      const { nockDone, context } = await nock.back('getFromAddressETH.json');
      let info = await tenderly.getForkInfo();
      assert.equal(info.fork.block_number, '16617737');
      assert.equal(info.fork.network_id, '1');
      nockDone();
    });
  });

  describe('#getForkId', function () {
    it('should return the ID of the fork', function () {
      assert.equal(tenderly.getForkId(), '38655d0a-4d2e-4b54-aa49-042a113a24ed');
    });
  });
});
