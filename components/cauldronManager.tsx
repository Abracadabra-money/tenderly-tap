import { useState, useEffect, ChangeEvent, MouseEvent, ChangeEventHandler } from 'react';
import { safeJsonParse, camelize, formatAddress } from '../helpers/utils';
import { TenderlyManager } from '../models/tenderlyManager';
import { FlashState, ChainConfig, FaucetProps } from '../helpers/interfaces';
import ChainSelect from './chainSelect';
import ForkUrlInput from './forkUrlInput';
import SubmitButton from './submitButton';

export default function Faucet(props: FaucetProps) {
  const [cauldronAddress, setCauldronAddress] = useState('');
  const [forkUrl, setForkUrl] = useState('');
  const [chain, setChain] = useState('ETH');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holderAddresses, setHolderAddresses] = useState('');

  useEffect(function () {
    setForkUrl(safeJsonParse(window.localStorage.getItem('forkUrl')));
    setCauldronAddress(safeJsonParse(window.localStorage.getItem('cauldronAddress')));
    setTokenAmount(safeJsonParse(window.localStorage.getItem('tokenAmount')));
    setHolderAddresses(safeJsonParse(window.localStorage.getItem('holderAddresses')));
  }, []);

  function saveToLocalStorage(key: string, value: string) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function handleChange(key: string, value: string, setter: Function) {
    if (key == 'chain') {
      saveToLocalStorage('cauldronAddress', '');
      setCauldronAddress('');
    }

    saveToLocalStorage(key, value);
    setter(value);
  }

  function isAddress(value: string) {
    return value.toLowerCase().substring(0, 2) === '0x';
  }

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    try {
      setIsSubmitting(true);
      event.preventDefault();
      event.preventDefault();
      let tenderlyManager = new TenderlyManager(chain, forkUrl);
      await tenderlyManager.topUpCauldron(cauldronAddress, tokenAmount, holderAddresses.split(','));
      showFlashMessage({
        type: 'success',
        boldMessage: 'Success!',
        message: `Refilled cauldron ${formatAddress(cauldronAddress)}with ${tokenAmount} MIM`,
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
        {renderInputGroup('cauldronAddress', 'Cauldron address', '0x123..abc', cauldronAddress, (event: ChangeEvent) =>
          handleChange(
            (event.target as HTMLInputElement).name,
            (event.target as HTMLInputElement).value,
            setCauldronAddress
          )
        )}

        {renderInputGroup('tokenAmount', 'Amount', '1000', tokenAmount, (event: ChangeEvent) =>
          handleChange(
            (event.target as HTMLInputElement).name,
            (event.target as HTMLInputElement).value,
            setTokenAmount
          )
        )}

        {renderInputGroup(
          'holderAddresses',
          'Holder addresses',
          '0x123...abc, 0x134...def',
          holderAddresses,
          (event: ChangeEvent) =>
            handleChange(
              (event.target as HTMLInputElement).name,
              (event.target as HTMLInputElement).value,
              setHolderAddresses
            ),
          { footnote: 'Addresses must be separated by commas' }
        )}
      </div>

      <SubmitButton handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
