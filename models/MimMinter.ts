import { BigNumber, ethers } from 'ethers';
import { ChainConfig } from '../helpers/interfaces';
import { getProvider } from '../helpers/utils';
import anySwapERC20Abi from '../abis/anySwapERC20Abi.json';
import mimERC20Abi from '../abis/mimERC20Abi.json';
import { first } from 'underscore';
import { TenderlyManager } from './tenderlyManager';
import { Tenderly } from './Tenderly';

const config: ChainConfig = require('../configs/chains.json');

export class MimMinter {
  forkUrl: string;
  provider: ethers.providers.JsonRpcProvider;
  chain: string;
  tenderly: Tenderly;

  constructor(chain: string, forkUrl: string) {
    this.chain = chain; // options are ETH, AVAX, FTM
    this.forkUrl = forkUrl;
    this.provider = getProvider(forkUrl);
    this.tenderly = new Tenderly(forkUrl);
  }

  getMimAddress() {
    return config[this.chain].tokens['mim'];
  }

  getMimContract() {
    return new ethers.Contract(
      this.getMimAddress(),
      this.chain == 'ETH' ? mimERC20Abi : anySwapERC20Abi,
      this.provider
    );
  }

  async getFromAddress() {
    if (this.chain == 'ETH') return await this.getMimContract().owner();
    else return first(await this.getMimContract().getAllMinters());
  }

  async mintMim(toAddress: string, amount: BigNumber) {
    await this.tenderly.execute(this.getMimContract(), await this.getFromAddress(), 'mint', [toAddress, amount]);
  }
}
