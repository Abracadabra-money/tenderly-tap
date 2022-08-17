import {
  MouseEventHandler,
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
  MouseEvent,
  ChangeEventHandler,
} from 'react';
import { safeJsonParse, camelize, formatAddress } from '../helpers/utils';
import Image from 'next/image';
import ChainOption from './chainOption';
import { Chain } from '../models/chain';
import { map, find, keys } from 'underscore';
import { TenderlyManager } from '../models/tenderlyManager';
import { FlashState } from '../helpers/interfaces';

interface ChainConfig {
  [key: string]: any;
}

interface FaucetProps {
  setFlashMessage: Function;
}

const config: ChainConfig = require('../configs/chains.json');
// toAddress: string;
// chain: string;
// token: string;
// forkUrl: string;
// tokenAmount: number;
// flashMsg: string;
// cauldronAddress: string;
// holderAddresses: string;

const chainOptions = map(keys(config), (key) => new Chain(key, config[key].imageUrl));

export default function Faucet(props: FaucetProps) {
  const [toAddress, setToAddress] = useState('');
  const [forkUrl, setForkUrl] = useState('');
  const [chain, setChain] = useState('ETH');
  const [showChainList, setShowChainList] = useState(false);
  const [holderAddresses, setHolderAddresses] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');

  const chainList = useRef(null);

  useEffect(function () {
    setForkUrl(safeJsonParse(window.localStorage.getItem('forkUrl')));
    setToAddress(safeJsonParse(window.localStorage.getItem('toAddress')));
    setChain(safeJsonParse(window.localStorage.getItem('chain')));
    setHolderAddresses(safeJsonParse(window.localStorage.getItem('holderAddresses')));
    setTokenAddress(safeJsonParse(window.localStorage.getItem('tokenAddress')));
    setTokenAmount(safeJsonParse(window.localStorage.getItem('tokenAmount')));

    props.setFlashMessage({
      type: 'success',
      boldMessage: 'Success!',
      message: `Sent ${tokenAmount} ${getTokenNameFromAddress(tokenAddress).toUpperCase()} to ${formatAddress(
        toAddress
      )}`,
    });
  }, []);

  useEffect(() => {
    // only add the event listener when the dropdown is opened
    if (!showChainList) return;
    function handleClick(event: Event) {
      if (chainList.current && !chainList.current.contains(event.target)) {
        setShowChainList(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showChainList]);

  useEffect(() => {
    handleChange('tokenAddress', '', setTokenAddress);
  }, [chain]);

  function saveToLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function handleChange(key: string, value: string, setter: Function) {
    saveToLocalStorage(key, value);
    setter(value);
  }

  function isAddress(value: string) {
    return value.toLowerCase().substring(0, 2) === '0x';
  }

  function handleTokenChange(event: ChangeEvent<HTMLInputElement>) {
    var tokenAddress = '';
    console.log(event.target.value);
    if (isAddress(event.target.value)) {
      tokenAddress = event.target.value;
    } else {
      tokenAddress = config[chain].tokens[event.target.value];
    }
    handleChange('tokenAddress', tokenAddress, setTokenAddress);
  }

  function getTokenAddressOptions() {
    let rows = [];
    for (let [token, address] of Object.entries(config[chain].tokens)) {
      rows.push(
        <option value={token} key={token} selected={address === tokenAddress}>
          {token}
        </option>
      );
    }
    return rows;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      let tenderlyManager = new TenderlyManager(chain, forkUrl);
      await tenderlyManager.addTokenToWallet(
        tokenAddress,
        toAddress,
        parseFloat(tokenAmount),
        holderAddresses.split(',')
      );
      showFlashMessage({
        type: 'success',
        boldMessage: 'Success!',
        message: `Sent ${tokenAmount} ${getTokenNameFromAddress(tokenAddress).toUpperCase()} to ${formatAddress(
          toAddress
        )}`,
      });
    } catch (error) {
      console.log(error);
      showFlashMessage({
        type: 'error',
        boldMessage: 'Porcodillo!',
        message: `Error: ${error}`,
      });
    }
    event.preventDefault();
  }

  function getChainOptions() {
    return map(chainOptions, (chainOption) => (
      <ChainOption
        key={`chainlist-option-${chainOption.name}`}
        name={chainOption.name}
        imageUrl={chainOption.imageUrl}
        currentChain={chain}
        onClick={(name: string) => handleChange('chain', name, setChain)}
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

  function renderInputGroup(
    name: string,
    label: string,
    placeholder: string,
    stateVariable: string,
    onChangeFn: ChangeEventHandler,
    optionalArgs?: { [key: string]: any }
  ) {
    var hasList = optionalArgs?.list && optionalArgs.list.length > 0;
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            name={name}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder={placeholder}
            value={stateVariable}
            onChange={onChangeFn}
            list={hasList ? `${name}-data-list` : ''}
          />
        </div>
        {hasList ? <datalist id={`${name}-data-list`}>{optionalArgs.list}</datalist> : ''}
        {optionalArgs?.footnote ? <p className="mt-2 text-xs ml-0 text-gray-500">{optionalArgs.footnote}</p> : ''}
      </div>
    );
  }

  function getTokenNameFromAddress(tokenAddress: string) {
    for (let [token, address] of Object.entries(config[chain].tokens)) {
      if (address == tokenAddress) return token;
    }
    return formatAddress(tokenAddress);
  }

  function showFlashMessage(msg: FlashState) {
    props.setFlashMessage(msg);
    setTimeout(() => props.setFlashMessage(undefined), 5000);
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-10 col-start-2 lg:col-span-3 lg:col-start-2">
        <h2 className="text-gray-500">01</h2>
        <h1>TENDERLY INFO</h1>
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-6 lg:mt-10">
        {renderInputGroup(
          'forkUrl',
          'Tenderly fork URL',
          'https://rpc.tenderly.co/fork/...',
          forkUrl,
          (event: ChangeEvent) => handleChange(event.target.name, event.target.value, setForkUrl)
        )}

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
                  src={find(chainOptions, (chainOption) => chainOption.name == chain)?.imageUrl}
                  alt=""
                  className="flex-shrink-0 h-6 w-6 rounded-full"
                  width={28}
                  height={28}
                />
                <span className="ml-3 block truncate">{chain}</span>
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
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-3 lg:col-start-2">
        <h2 className="text-gray-500">02</h2>
        <h1>TX INFO</h1>
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-6 lg:mt-10">
        {renderInputGroup('toAddress', 'To address', '0x123..abc', toAddress, (event: ChangeEvent) =>
          handleChange(event.target.name, event.target.value, setToAddress)
        )}

        {renderInputGroup('tokenAmount', 'Amount', '1000', tokenAmount, (event: ChangeEvent) =>
          handleChange(event.target.name, event.target.value, setTokenAmount)
        )}

        {renderInputGroup(
          'tokenAddress',
          'Token address',
          '0x123...abc',
          tokenAddress,
          (event: ChangeEvent) => handleTokenChange(event),
          { list: getTokenAddressOptions() }
        )}

        {renderInputGroup(
          'holderAddresses',
          'Holder addresses',
          '0x123...abc, 0x234...def',
          holderAddresses,
          (event: ChangeEvent) => (event) => handleChange(event.target.name, event.target.value, setHolderAddresses),
          { footnote: 'Addresses must be separated by commas' }
        )}
      </div>

      <div className="col-span-10 col-start-2 lg:col-start-1">
        <div className="text-right pb-5">
          <button
            type="submit"
            className="w-full lg:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
