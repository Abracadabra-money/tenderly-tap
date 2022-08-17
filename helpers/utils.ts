import { ChainConfig } from '../helpers/interfaces';
import { findKey } from 'underscore';

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
