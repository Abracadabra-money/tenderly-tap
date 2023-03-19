import { BigNumber, Contract, ethers } from 'ethers';
import { compact, map, object, union, uniq, values, zip } from 'underscore';
import { FlashState, ChainConfig, FaucetProps } from '../helpers/interfaces';
import { bn, bnToFloat, expandDecimals, getContract, getProvider } from '../helpers/utils';
import { Tenderly } from './Tenderly';
import { Abracadabra, ChainSymbol, Token } from 'abracadabra-sdk';

const config: ChainConfig = require('../configs/chains.json');

export class TokenTransferer {
  forkUrl;
  provider: ethers.providers.JsonRpcProvider;
  chain: string;
  tenderly: Tenderly;
  client: Abracadabra;
  token: Token;

  constructor(chain: string, tokenAddress: string, forkUrl: string) {
    this.forkUrl = forkUrl;
    this.chain = chain;
    this.client = new Abracadabra(ChainSymbol.ethereum, { provider: getProvider(forkUrl) });
    this.token = new Token(this.client, tokenAddress);
    this.provider = getProvider(forkUrl);
    this.tenderly = new Tenderly(forkUrl);
  }

  async formatAmount(amount: string | number): Promise<BigNumber> {
    let decimals = await this.token.decimals();
    return bn(amount).mul(expandDecimals(decimals));
  }

  async printHolders(addresses: Array<string>, balances: Array<BigNumber>) {
    let decimals = await this.token.decimals();
    console.table(
      map(zip(addresses, balances), ([addr, balance]) => {
        return { address: addr, balance: bnToFloat(balance.toString(), decimals) };
      })
    );
  }

  async findHolder(
    formattedAmount: BigNumber,
    addedHolders: Array<string> = []
  ): Promise<{ status: string; holder?: string; msg?: string }> {
    let largeHolders = values(config[this.chain].largeHolders);

    let addresses = uniq(compact(union(largeHolders, addedHolders)));
    let balances = await Promise.all(map(addresses, (addr) => this.token.balanceOf(addr)));
    this.printHolders(addresses, balances);

    for (let i = 0; i < balances.length; i++) {
      let sufficientBalance = balances[i].gte(formattedAmount);
      if (sufficientBalance) return { status: 'success', holder: addresses[i] };
    }

    return { status: 'error', holder: undefined, msg: 'Cannot find an address with enough tokens.' };
  }

  async addTokenToWallet(
    toAddress: string,
    amount: string | number,
    holderAddresses: Array<string> = []
  ): Promise<{ status: string; txHash?: string; msg?: string }> {
    let formattedAmount = await this.formatAmount(amount);

    let result = await this.findHolder(formattedAmount, holderAddresses);
    if (result.holder == undefined) return result;

    let tx = await this.tenderly.execute(this.token.contract, result.holder, 'transfer', [toAddress, formattedAmount]);
    return { status: 'success', txHash: tx };
  }
}
