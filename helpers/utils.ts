import { ChainConfig } from '../helpers/interfaces';
import { findKey } from 'underscore';
import { BigNumber, ethers } from 'ethers';

export function safeJsonParse(value: string | null): string {
  try {
    if (value == null) return '';
    else return JSON.parse(value) || '';
  } catch (e) {
    console.log(`Error parsing JSON: ${value}`);
    return '';
  }
}

export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word: string, index: number) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function formatAddress(address: string) {
  return address.substring(0, 5) + '...' + address.substring(address.length - 5, address.length);
}

export function getChainFromId(chainId: string) {
  const config: ChainConfig = require('../configs/chains.json');
  return findKey(config, (data: { [key: string]: any }) => {
    return data.chainId == chainId;
  });
}

export function getProvider(forkUrl: string): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(forkUrl);
}

export function getContract(
  address: string,
  abi: ethers.ContractInterface,
  provider: ethers.providers.JsonRpcProvider
) {
  return new ethers.Contract(address, abi, provider);
}

export function bnToFloat(num: BigNumber, decimal: number) {
  return parseFloat(ethers.utils.formatUnits(num, decimal));
}

export function expandDecimals(decimal: number) {
  return BigNumber.from(10).pow(decimal);
}

export function bn(num: string | number) {
  return BigNumber.from(num);
}
