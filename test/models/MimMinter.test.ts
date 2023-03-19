import { assert } from 'chai';
import { MimMinter } from '../../models/MimMinter';
import nock from 'nock';
import { ethers } from 'ethers';

describe('MimMinter', function () {
  var minter: MimMinter;

  beforeEach(function () {
    minter = new MimMinter('ETH', process.env.NEXT_TENDERLY_MAINNET_FORK!);

    nock.back.fixtures = __dirname + '/fixtures/MimMinter';
    nock.back.setMode('record');
  });

  describe('#getMimAddress', function () {
    it('should get the correct chain address for MIM', async function () {
      assert.equal(minter.getMimAddress(), '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3');

      minter = new MimMinter('ARBI', 'someUrl');
      assert.equal(minter.getMimAddress(), '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a');
    });
  });

  describe('#getFromAddress', function () {
    it('should return the owner for ETH', async function () {
      const { nockDone, context } = await nock.back('getFromAddressETH.json');
      assert.equal(await minter.getFromAddress(), '0x5f0DeE98360d8200b20812e174d139A1a633EDd2');
      nockDone();
    });

    it('should return the owner for AVAX', async function () {
      const { nockDone, context } = await nock.back('getFromAddressAVAX.json');
      minter = new MimMinter('AVAX', process.env.NEXT_TENDERLY_AVAX_FORK!);
      assert.equal(await minter.getFromAddress(), '0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8');
      nockDone();
    });
  });

  describe('#mintMim', function () {
    it('should mint MIM on ETH', async function () {
      const { nockDone, context } = await nock.back('mintMimETH.json');
      let mim = minter.getMimContract();
      let initialBalance = await mim.balanceOf('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee');
      await minter.mintMim('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee', ethers.utils.parseEther('1000'));
      assert.equal(
        (await mim.balanceOf('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee')).toString(),
        initialBalance.add(ethers.utils.parseEther('1000')).toString()
      );
      nockDone();
    });

    it('should mint MIM on AVAX', async function () {
      const { nockDone, context } = await nock.back('mintMimAVAX.json');
      minter = new MimMinter('AVAX', process.env.NEXT_TENDERLY_AVAX_FORK!);
      let mim = minter.getMimContract();
      let initialBalance = await mim.balanceOf('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee');
      await minter.mintMim('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee', ethers.utils.parseEther('1000'));
      assert.equal(
        (await mim.balanceOf('0x1235661aF3F7F026CE74259c4d18193B8FB7d7ee')).toString(),
        initialBalance.add(ethers.utils.parseEther('1000')).toString()
      );
      nockDone();
    });
  });
});
