import { useState, useEffect, ChangeEvent, MouseEvent, ChangeEventHandler } from 'react';
import { safeJsonParse, camelize, formatAddress } from '../helpers/utils';
import { TenderlyManager } from '../models/tenderlyManager';
import { FlashState, ChainConfig, FaucetProps } from '../helpers/interfaces';
import ChainSelect from './chainSelect';
import Spinner from './spinner';
import ForkUrlInput from './forkUrlInput';
import SubmitButton from './submitButton';

const config: ChainConfig = require('../configs/chains.json');
// toAddress: string;
// chain: string;
// token: string;
// forkUrl: string;
// tokenAmount: number;
// flashMsg: string;
// cauldronAddress: string;
// holderAddresses: string;

export default function GasManager(props: FaucetProps) {
  const [toAddress, setToAddress] = useState('');
  const [forkUrl, setForkUrl] = useState('');
  const [chain, setChain] = useState('ETH');
  const [tokenAmount, setTokenAmount] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(function () {
    setForkUrl(safeJsonParse(window.localStorage.getItem('forkUrl')));
    setTokenAmount(safeJsonParse(window.localStorage.getItem('tokenAmount')));
  }, []);

  function saveToLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function isAddress(value: string) {
    return value.toLowerCase().substring(0, 2) === '0x';
  }

  function handleChange(key: string, value: string, setter: Function) {
    if (key == 'chain') {
      saveToLocalStorage('tokenAddress', '');
    }

    saveToLocalStorage(key, value);
    setter(value);
  }

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    try {
      setIsSubmitting(true);
      event.preventDefault();

      let tenderlyManager = new TenderlyManager(chain, forkUrl);
      await tenderlyManager.addGasToken(toAddress, parseFloat(tokenAmount));
      showFlashMessage({
        type: 'success',
        boldMessage: 'Success!',
        message: `Sent ${tokenAmount} gas tokens to ${formatAddress(toAddress)}`,
      });
    } catch (error) {
      showFlashMessage({
        type: 'error',
        boldMessage: 'Porcodillo!',
        message: `Error: ${error}`,
      });
    }
    setIsSubmitting(false);
    event.preventDefault();
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
        {hasList ? <datalist id={`${name}-data-list`}>{optionalArgs?.list}</datalist> : ''}
        {optionalArgs?.footnote ? <p className="mt-2 text-xs ml-0 text-gray-500">{optionalArgs?.footnote}</p> : ''}
      </div>
    );
  }

  function showFlashMessage(msg: FlashState) {
    props.setFlashMessage(msg);
    setTimeout(() => props.setFlashMessage(undefined), 50000);
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-10 col-start-2 lg:col-span-3 lg:col-start-2">
        <h2 className="text-gray-500">01</h2>
        <h1>TENDERLY INFO</h1>
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-6 lg:mt-10">
        <ForkUrlInput
          forkUrl={forkUrl}
          handleChange={handleChange}
          setForkUrl={setForkUrl}
          showFlashMessage={showFlashMessage}
          setChain={setChain}
          chain={chain}
        />
        <ChainSelect chain={chain} handleChange={handleChange} setChain={setChain}></ChainSelect>
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-3 lg:col-start-2">
        <h2 className="text-gray-500">02</h2>
        <h1>CAULDRON INFO</h1>
      </div>
      <div className="col-span-10 col-start-2 lg:col-span-6 lg:mt-10">
        {renderInputGroup('toAddress', 'To address', '0x123..abc', toAddress, (event: ChangeEvent) =>
          handleChange((event.target as HTMLInputElement).name, (event.target as HTMLInputElement).value, setToAddress)
        )}

        {renderInputGroup('tokenAmount', 'Amount', '1000', tokenAmount, (event: ChangeEvent) =>
          handleChange(
            (event.target as HTMLInputElement).name,
            (event.target as HTMLInputElement).value,
            setTokenAmount
          )
        )}
      </div>

      <SubmitButton handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
