import Image from 'next/image';
import { Ref, useEffect, useRef, useState } from 'react';
import { find, map, keys } from 'underscore';
import ChainOption from './chainOption';
import { Chain } from '../models/chain';
import { ChainConfig } from '../helpers/interfaces';
import { safeJsonParse } from '../helpers/utils';

interface ChainSelectProps {
  chain: string;
  handleChange: Function;
  setChain: Function;
}

export default function ChainSelect(props: ChainSelectProps) {
  const [showChainList, setShowChainList] = useState(false);
  const chainList = useRef<HTMLDivElement>(null);

  const config: ChainConfig = require('../configs/chains.json');
  const chainOptions = map(keys(config), (key) => new Chain(key, config[key].imageUrl));

  useEffect(function () {
    if (window.localStorage.getItem('chain')) props.setChain(safeJsonParse(window.localStorage.getItem('chain')));
  }, []);

  useEffect(() => {
    // only add the event listener when the dropdown is opened
    if (!showChainList) return;
    function handleClick(event: Event) {
      if (chainList.current && !chainList.current.contains(event.target as HTMLElement)) {
        setShowChainList(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showChainList]);

  function getChainOptions() {
    return map(chainOptions, (chainOption) => (
      <ChainOption
        key={`chainlist-option-${chainOption.name}`}
        name={chainOption.name}
        imageUrl={chainOption.imageUrl}
        currentChain={props.chain}
        onClick={(name: string) => props.handleChange('chain', name, props.setChain)}
      ></ChainOption>
    ));
  }

  function renderSelectArrow() {
    return (
      <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return (
    <div className="mb-4" ref={chainList}>
      <label id="listbox-label" className="block text-sm font-medium text-gray-700">
        Chain
      </label>
      <div className="mt-1 relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          onFocus={() => setShowChainList(true)}
        >
          <span className="flex items-center">
            <Image
              src={find(chainOptions, (chainOption) => chainOption.name == props.chain)?.imageUrl || ''}
              alt=""
              className="flex-shrink-0 h-6 w-6 rounded-full"
              width={28}
              height={28}
            />
            <span className="ml-3 block truncate">{props.chain}</span>
          </span>
          {renderSelectArrow()}
        </button>

        <ul
          className={`absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${
            showChainList ? '' : 'hidden'
          }`}
          tabIndex={-1}
          role="listbox"
          aria-labelledby="listbox-label"
          aria-activedescendant="listbox-option-3"
        >
          {getChainOptions()}
        </ul>
      </div>
    </div>
  );
}
