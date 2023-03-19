import { BigNumber, ethers } from 'ethers';
import { ChainConfig } from '../helpers/interfaces';
import { getContract, getProvider } from '../helpers/utils';
import cauldronAbi from '../abis/cauldronAbi.json';
import bentoAbi from '../abis/bentoAbi.json';
import { Tenderly } from './Tenderly';
import { MimMinter } from './MimMinter';
import { expandDecimals, bn } from '../helpers/utils';

const config: ChainConfig = require('../configs/chains.json');
const MAX_NUM = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export class CauldronTransferer {
  forkUrl: string;
  provider: ethers.providers.JsonRpcProvider;
  chain: string;
  tenderly: Tenderly;
  mimMinter: MimMinter;
  cauldronAddress: string;

  constructor(chain: string, cauldronAddress: string, forkUrl: string) {
    this.chain = chain; // options are ETH, AVAX, FTM
    this.forkUrl = forkUrl;
    this.cauldronAddress = cauldronAddress;
    this.provider = getProvider(forkUrl);
    this.tenderly = new Tenderly(forkUrl);
    this.mimMinter = new MimMinter(chain, forkUrl);
  }

  async getBentoBoxContract() {
    let bentoBoxAddress = await getContract(this.cauldronAddress, cauldronAbi, this.provider).bentoBox();
    return getContract(bentoBoxAddress, bentoAbi, this.provider);
  }

  async approve(walletAddr: string, spenderAddr: string, amount: BigNumber) {
    let functionArgs = [spenderAddr, amount];
    return await this.tenderly.execute(this.mimMinter.getMimContract(), walletAddr, 'approve', functionArgs);
  }

  async topUpCauldron(amount: string) {
    let formattedAmount = bn(amount).mul(expandDecimals(18));
    let bentoBoxContract = await this.getBentoBoxContract();

    let fromAddress = ethers.Wallet.createRandom().address;
    await this.mimMinter.mintMim(fromAddress, formattedAmount);
    await this.approve(fromAddress, bentoBoxContract.address, MAX_NUM);

    let functionArgs = [
      this.mimMinter.getMimAddress(), // token_ (address),
      fromAddress, // from (address),
      this.cauldronAddress, // to (address),
      formattedAmount.toString(), // amount,
      formattedAmount.toString(), // share
    ];

    let txHash = await this.tenderly.execute(bentoBoxContract, fromAddress, 'deposit', functionArgs);
    return { status: 'success', txHash: txHash };
  }
}
