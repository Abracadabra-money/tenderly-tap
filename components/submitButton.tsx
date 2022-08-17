import { MouseEventHandler, useState } from 'react';
import Spinner from './spinner';

interface SubmitButtonProps {
  handleSubmit: MouseEventHandler<HTMLButtonElement>;
  isSubmitting: boolean;
}

export default function SubmitButton(props: SubmitButtonProps) {
  return (
    <div className="col-span-10 col-start-2 lg:col-start-1">
      <div className="text-right pb-5">
        <button
          type="submit"
          className="w-full lg:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={props.handleSubmit}
        >
          {props.isSubmitting ? <Spinner /> : 'Submit'}
        </button>
      </div>
    </div>
  );
}
