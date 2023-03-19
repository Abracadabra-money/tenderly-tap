import { useEffect, useState } from 'react';
import { getChainFromId } from '../helpers/utils';
import { Tenderly } from '../models/Tenderly';
import { Icon } from '@iconify/react';
import { ChainConfig } from '../helpers/interfaces';
import { utils } from 'ethers';

interface ForkUrlInputProps {
  forkUrl: string;
  chain: string;
  handleChange: Function;
  setForkUrl: Function;
  showFlashMessage: Function;
  setChain: Function;
}

export default function ForkUrlInput(props: ForkUrlInputProps) {
  const name = 'forkUrl';
  const label = 'Tenderly fork URL';
  const placeholder = 'https://rpc.tenderly.co/fork/...';
  const config: ChainConfig = require('../configs/chains.json');

  useEffect(
    function () {
      async function getChainIdFromFork() {
        if (props.forkUrl === '') return;
        let tenderly = new Tenderly(props.forkUrl);
        let chainId = await tenderly.getChainIdFromFork();
        let chain = getChainFromId(chainId);

        if (!chain) {
          props.showFlashMessage({
            type: 'error',
            boldMessage: 'Porcodillo!',
            message: `Error: I didn't recognize that chain!`,
          });
          return;
        }

        if (chain && chain !== props.chain) {
          props.handleChange('chain', chain, props.setChain);
        }
      }
      getChainIdFromFork();
    },
    [props, props.forkUrl]
  );

  function getChainIdFromChain() {
    return parseInt(config[props.chain].chainId);
  }

  function getNameFromChain() {
    return config[props.chain].name;
  }

  function getSymbolFromChain() {
    return config[props.chain].symbol;
  }

  async function addNetwork() {
    if (window.ethereum && window.ethereum.request)
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: utils.hexValue(getChainIdFromChain()),
            rpcUrls: [props.forkUrl],
            chainName: `${getNameFromChain()} (Tenderly)`,
            nativeCurrency: {
              name: props.chain,
              symbol: `${getSymbolFromChain()}`, // 2-6 characters long
              decimals: 18,
            },
          },
        ],
      });
  }

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <input
            type="text"
            name={name}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
            placeholder={placeholder}
            value={props.forkUrl}
            onChange={(event) => props.handleChange(event.target.name, event.target.value, props.setForkUrl)}
          />
        </div>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onClick={addNetwork}
        >
          <Icon icon="logos:metamask-icon" className="h-6 w-6 mx-2" />
          <span>Add to Metamask</span>
        </button>
      </div>
    </div>
  );
}
