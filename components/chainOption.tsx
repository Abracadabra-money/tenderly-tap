import Image from 'next/image';
import { useState } from 'react';

interface ChainOptionProps {
  name: string;
  imageUrl: string;
  currentChain: string;
  onClick: Function;
}

export default function ChainOption(props: ChainOptionProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <li
      className={`text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 ${
        isActive ? 'bg-indigo-600 text-white' : ''
      }`}
      id={`chainlist-option-${props.name}`}
      role="option"
      aria-selected={props.currentChain == props.name}
      onClick={() => {
        props.onClick(props.name);
      }}
      onMouseOver={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className="flex items-center">
        <Image src={props.imageUrl} alt="" className="flex-shrink-0 h-6 w-6 rounded-full" height={28} width={28} />

        <span className="font-normal ml-3 block truncate">{props.name}</span>
      </div>

      <span
        className={`text-indigo-700 absolute inset-y-0 right-0 flex items-center pr-4 ${
          props.currentChain == props.name ? '' : 'hidden'
        }`}
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={isActive ? 'white' : 'currentColor'}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </li>
  );
}
