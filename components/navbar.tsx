import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <div className="max-w-7xl mx-auto sm:px-6 xl:px-0">
        <div className="relative flex items-center justify-between h-16">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>

              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <svg
                className="hidden h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-1 flex items-center">
              <Image className="block h-8 w-auto" src="/beer-icon.jpeg" alt="Workflow" height={30} width={30} />
              <h1 className="ml-5">TENDERLY TAP</h1>
            </div>
            <div className="hidden sm:block sm:ml-6 sm:mt-2">
              <div className="flex space-x-4">
                <Link href="/" aria-current="page">
                  <p className="hover:border-amber-300 border-transparent border-b-2 px-3 py-2 text-sm font-medium">
                    Wallet Top Up
                  </p>
                </Link>

                <Link href="/cauldron-top-up">
                  <p className="hover:border-amber-300 border-transparent border-b-2 px-3 py-2 text-sm font-medium">
                    Cauldron Top Up
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
