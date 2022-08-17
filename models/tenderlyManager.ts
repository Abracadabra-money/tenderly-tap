import { ethers } from 'ethers';
import tokenAbi from '../abis/tokenAbi.json';
import wethAbi from '../abis/wethAbi.json';
import cauldronAbi from '../abis/cauldronAbi.json';
import bentoAbi from '../abis/bentoAbi.json';
import config from '../configs/chains.json';
import * as _ from 'underscore';

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

  getRpc() {
    return this.forkUrl;
  }

  getProvider() {
    return new ethers.providers.JsonRpcProvider(this.getRpc());
  }

  async addBalance(toAddress: string) {
    const params = [
      [toAddress],
      ethers.utils.hexValue(9000000000000000), // hex encoded wei amount
    ];

    let result = await this.provider.send('tenderly_addBalance', params);
    console.log(result);
  }

  getWrappedGasToken() {
    return this.getTokenAddress(`w${this.chain.toLowerCase()}`); // looks for weth, wavax, etc.
  }

  async addGasToken(toAddress: string, amount: number) {
    await this.addTokenToWallet('weth', toAddress, amount);
    let contract = new ethers.Contract(this.getWrappedGasToken(), wethAbi, this.provider);
    let tx = await this.execute(contract, toAddress, 'withdraw', [this.formatAmount(contract, amount)]);
    console.log(tx);
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

  async findHolder(tokenContract: ethers.Contract, txAmount, addedHolders: Array<string> = []) {
    let largeHolders = config[this.chain].largeHolders;
    for (let addr of _.union(Object.values(largeHolders), addedHolders)) {
      let balance = await tokenContract.connect(this.provider).balanceOf(addr);
      if (balance.gt(txAmount)) {
        console.log(`${addr} has ${balance} and can fulfill ${txAmount}!`);
        return String(addr);
      }
    }
  }

  async formatAmount(contract, amount) {
    let decimals = await contract.connect(this.provider).decimals();

    if (decimals == 18) return ethers.utils.parseEther(amount.toString());
    else return amount * Math.pow(10, decimals);
  }

  getTokenContract(tokenAddress) {
    return new ethers.Contract(tokenAddress, tokenAbi, this.provider);
  }

  getCauldronContract(cauldronAddress) {
    return new ethers.Contract(cauldronAddress, cauldronAbi, this.provider);
  }

  async getBentoBoxAddress(cauldronAddress) {
    return await this.getCauldronContract(cauldronAddress).connect(this.provider).bentoBox();
  }

  async getBentoBoxContract(bentoBoxAddress) {
    return new ethers.Contract(bentoBoxAddress, bentoAbi, this.provider);
  }

  async addTokenToWallet(tokenAddress: string, toAddress: string, amount: number, holderAddresses: Array<string> = []) {
    let contract = this.getTokenContract(tokenAddress);
    let txAmount = await this.formatAmount(contract, amount);

    let functionArgs = [toAddress, txAmount];
    return await this.execute(
      contract,
      await this.findHolder(contract, txAmount, holderAddresses),
      'transfer',
      functionArgs
    );
  }

  async execute(contract, fromAddress, method, functionArgs) {
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

  async approve(tokenContract: ethers.Contract, walletAddr: string, spenderAddr: string, amount) {
    let functionArgs = [spenderAddr, amount];
    return await this.execute(tokenContract, walletAddr, 'approve', functionArgs);
  }

  async topUpCauldron(cauldronAddress: string, amount: number) {
    let bentoBoxAddr = await this.getBentoBoxAddress(cauldronAddress);
    let bentoBoxContract = await this.getBentoBoxContract(bentoBoxAddr);
    let mimContract = await this.getTokenContract(this.getTokenAddress('mim'));
    let formattedAmount = await this.formatAmount(mimContract, amount);
    let fromAddress = await this.findHolder(mimContract, formattedAmount);

    console.log(await this.approve(mimContract, fromAddress, bentoBoxAddr, formattedAmount));

    let functionArgs = [
      this.getTokenAddress('mim'), // token_ (address),
      fromAddress, // from (address),
      cauldronAddress, // to (address),
      formattedAmount.toString(), // amount,
      formattedAmount.toString(), // share
    ];

    console.log(functionArgs);
    console.log(await this.execute(bentoBoxContract, fromAddress, 'deposit', functionArgs));
  }
}
