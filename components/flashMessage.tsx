import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FlashState } from '../helpers/interfaces';

export default function FlashMessage(props: { setFlashMessage: Function; flashMessage: FlashState | undefined }) {
  const [type, setType] = useState('');

  useEffect(() => {
    setType(props.flashMessage?.type as string);
  }, [props]);

  return (
    <div
      className={`${type || 'hidden'} ${
        type == 'success'
          ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
          : 'bg-red-100 border-red-400 text-red-700'
      } px-4 py-3 border rounded absolute top-36 left-10 right-10 sm:top-10 sm:w-96 sm:right-10 sm:left-auto`}
      role="alert"
    >
      <div className="mr-5">
        <strong className="font-bold">{props.flashMessage?.boldMessage}</strong>
        <span className="block sm:inline sm:pl-2">{props.flashMessage?.message}</span>
      </div>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={() => {
          props.setFlashMessage(undefined);
        }}
      >
        <svg className={`fill-current h-6 w-6`} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
}
