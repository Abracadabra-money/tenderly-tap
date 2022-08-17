import { BigNumber, Contract, ethers } from 'ethers';
import tokenAbi from '../abis/tokenAbi.json';
import wethAbi from '../abis/wethAbi.json';
import cauldronAbi from '../abis/cauldronAbi.json';
import bentoAbi from '../abis/bentoAbi.json';
import { compact, union } from 'underscore';
import { FlashState, ChainConfig, FaucetProps } from '../helpers/interfaces';
import axios from 'axios';

const config: ChainConfig = require('../configs/chains.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export class TenderlyManager {
  forkUrl;
  provider: ethers.providers.JsonRpcProvider;
  gasOptions;
  chain: string;

  constructor(chain: string, forkUrl: string) {
    this.chain = chain; // options are ETH, AVAX, FTM
    this.forkUrl = forkUrl;
    this.provider = this.getProvider();
    this.gasOptions = { gasPrice: 66, gasLimit: 500000 };
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

  getRpc() {
    return this.forkUrl;
  }

  getProvider() {
    return new ethers.providers.JsonRpcProvider(this.getRpc());
  }

  async addGasToken(toAddress: string, amount: number) {
    const params = [
      [toAddress],
      ethers.utils.hexValue(ethers.utils.parseUnits(amount.toString(), 'ether').toHexString()),
    ];

    let result = await this.provider.send('tenderly_addBalance', params);
    console.log(result);
  }

  getTokenAddress(name: string) {
    let addr = config[this.chain]?.tokens[name];
    if (addr) return addr;
    else throw `Need to add ${name} to config.json`;
  }

  getCauldronAddress(name: string) {
    let addr = config[this.chain]?.cauldrons[name];
    if (addr) return addr;
    else throw `Need to add ${name} to config.json`;
  }

  async findHolder(
    tokenContract: ethers.Contract,
    txAmount: BigNumber,
    addedHolders: Array<string> = []
  ): Promise<{ status: string; holder?: string; msg?: string }> {
    let largeHolders = config[this.chain].largeHolders;
    for (let addr of compact(union(Object.values(largeHolders), addedHolders))) {
      let balance = await tokenContract.connect(this.provider).balanceOf(addr);
      let sufficientBalance = balance.gte(txAmount);

      console.log(`${addr} has ${balance} and ${sufficientBalance ? 'can' : 'cannot'} fulfill ${txAmount}!`);
      if (sufficientBalance) return { status: 'success', holder: String(addr) };
    }

    return { status: 'error', holder: undefined, msg: 'Cannot find an address with enough tokens.' };
  }

  async formatAmount(contract: Contract, amount: string | number): Promise<BigNumber> {
    let decimals = await contract.connect(this.provider).decimals();

    if (decimals == 18) return ethers.utils.parseEther(amount.toString());
    else return BigNumber.from(amount).mul(Math.pow(10, decimals));
  }

  getTokenContract(tokenAddress: string) {
    return new ethers.Contract(tokenAddress, tokenAbi, this.provider);
  }

  getCauldronContract(cauldronAddress: string) {
    return new ethers.Contract(cauldronAddress, cauldronAbi, this.provider);
  }

  async getBentoBoxAddress(cauldronAddress: string) {
    return await this.getCauldronContract(cauldronAddress).connect(this.provider).bentoBox();
  }

  async getBentoBoxContract(bentoBoxAddress: string) {
    return new ethers.Contract(bentoBoxAddress, bentoAbi, this.provider);
  }

  async addTokenToWallet(
    tokenAddress: string,
    toAddress: string,
    amount: number,
    holderAddresses: Array<string> = []
  ): Promise<{ status: string; txHash?: string; msg?: string }> {
    let contract = this.getTokenContract(tokenAddress);
    let txAmount = await this.formatAmount(contract, amount);

    let result = await this.findHolder(contract, txAmount, holderAddresses);
    console.log(result);
    if (result.holder == undefined) return result;

    let tx = await this.execute(contract, result.holder, 'transfer', [toAddress, txAmount]);
    return { status: 'success', txHash: tx };
  }

  async execute(contract: Contract, fromAddress: string, method: string, functionArgs: any) {
    console.log(functionArgs);
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

  async addAllTokensToWallet(toAddress: string) {
    await this.addGasToken(toAddress, 100);
    for (let [key, addr] of Object.entries(config[this.chain].tokens)) {
      await this.addTokenToWallet(key, toAddress, 1_00);
    }
  }

  async approve(tokenContract: ethers.Contract, walletAddr: string, spenderAddr: string, amount: BigNumber) {
    let functionArgs = [spenderAddr, amount];
    return await this.execute(tokenContract, walletAddr, 'approve', functionArgs);
  }

  async topUpCauldron(cauldronAddress: string, amount: string, addedHolders: Array<string> = []) {
    let bentoBoxAddr = await this.getBentoBoxAddress(cauldronAddress);
    let bentoBoxContract = await this.getBentoBoxContract(bentoBoxAddr);
    let mimContract = await this.getTokenContract(this.getTokenAddress('mim'));
    let formattedAmount = await this.formatAmount(mimContract, amount);
    let result = await this.findHolder(mimContract, formattedAmount, addedHolders);

    if (result.holder == undefined) return result;
    console.log(await this.approve(mimContract, result.holder, bentoBoxAddr, formattedAmount));

    let functionArgs = [
      this.getTokenAddress('mim'), // token_ (address),
      result.holder, // from (address),
      cauldronAddress, // to (address),
      formattedAmount.toString(), // amount,
      formattedAmount.toString(), // share
    ];

    let txHash = await this.execute(bentoBoxContract, result.holder, 'deposit', functionArgs);
    return { status: 'success', txHash: txHash };
  }
}
