import axios from 'axios';
import { BigNumber, Contract, ethers } from 'ethers';
import { getProvider } from '../helpers/utils';

export class Tenderly {
  forkUrl: string;
  provider: ethers.providers.JsonRpcProvider;

  constructor(forkUrl: string) {
    this.forkUrl = forkUrl;
    this.provider = getProvider(forkUrl);
  }

  getForkId() {
    // Assumes format of 'https://rpc.tenderly.co/fork/320a405a-8c62-40a1-bec5-addfb70a8437'
    let matches = this.forkUrl.match(/\/fork\/([a-z0-9-]+)/i);
    return matches && matches.length == 2 ? matches[1] : null;
  }

  async getForkInfo() {
    let { data } = await axios.get(
      `https://api.tenderly.co/api/v2/project/${process.env.NEXT_PUBLIC_TENDERLY_SLUG}/forks/${this.getForkId()}`,
      {
        headers: {
          'X-Access-Key': process.env.NEXT_PUBLIC_TENDERLY_ACCESS_KEY as string,
        },
      }
    );
    return data;
  }

  async getChainIdFromFork() {
    return (await this.getForkInfo()).fork.network_id;
  }

  async addGasToken(toAddress: string, amount: string | number) {
    let formattedAmount = ethers.utils.parseEther(amount.toString());
    const params = [[toAddress], ethers.utils.hexValue(formattedAmount.toHexString())];
    await this.provider.send('tenderly_addBalance', params);
  }

  async execute(contract: Contract, fromAddress: string, method: string, functionArgs: any) {
    const unsignedTx = await contract.populateTransaction[method](...functionArgs);
    const tenderlyArgs = [
      {
        to: contract.address,
        from: fromAddress,
        data: unsignedTx.data,
        value: ethers.utils.hexValue(0),
      },
    ];
    return await this.provider.send('eth_sendTransaction', tenderlyArgs);
  }
}
