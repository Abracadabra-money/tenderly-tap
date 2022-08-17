import { FlashState, ChainConfig, FaucetProps } from '../helpers/interfaces';
import { values } from 'underscore';
import config from '../configs/chains.json';
import { providers, ethers } from 'ethers';
import cauldronAbi from '../abis/cauldronAbi.json';

require('dotenv').config();

let cauldrons = config['BNB'].cauldrons;
let provider = new ethers.providers.JsonRpcProvider(config['BNB'].rpc);

let privateKey: string = process.env.WALLET_PK || '';
let wallet = new ethers.Wallet(privateKey, provider);

export async function waitForTx(provider: ethers.providers.JsonRpcProvider, tx: ethers.Transaction) {
  console.log(`Submitted tx: ${tx.hash}`);
  await provider.waitForTransaction(tx.hash as string);
  let result = await provider.getTransactionReceipt(tx.hash as string);

  if (result.status == 0) {
    console.log(`Transaction ${tx.hash} failed.`);
    console.log(result);
  } else {
    console.log(`Transaction ${tx.hash} suceeded.`);
  }

  return result;
}

async function main() {
  for (let cauldronAddress of values(cauldrons)) {
    console.log(`Cauldron Address: ${cauldronAddress}`);
    let contract = new ethers.Contract(cauldronAddress, cauldronAbi);

    console.log(`Exchange rate: ${await contract.connect(wallet).exchangeRate()}`);

    // FTM: { gasPrice: 3_015_000_000_000, gasLimit: 150_000 }
    // AVAX: { gasPrice: 27_000_000_000, gasLimit: 90_000 }
    // BNB: { gasPrice: 5_000_000_000, gasLimit: 65_000 }
    let tx = await contract.connect(wallet).updateExchangeRate({ gasPrice: 27_000_000_000, gasLimit: 90_000 });
    console.log(tx);
    await waitForTx(provider, tx);
  }
}

main();
