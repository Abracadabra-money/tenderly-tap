import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const mobileMenu = useRef<HTMLDivElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  useEffect(() => {
    // only add the event listener when the dropdown is opened
    if (!showMenu) return;
    function handleClick(event: Event) {
      if (
        mobileMenu.current &&
        mobileButton.current &&
        !mobileMenu.current.contains(event.target as HTMLElement) &&
        !mobileButton.current?.contains(event.target as HTMLElement)
      ) {
        setShowMenu(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showMenu]);

  return (
    <nav>
      <div className="max-w-7xl mx-auto sm:px-6 xl:px-0">
        <div className="relative flex items-center justify-between h-16">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              ref={mobileButton}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-700 hover:underline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setShowMenu(!showMenu)}
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
                  <p
                    className={`hover:border-amber-300 border-transparent border-b-2 px-3 py-2 text-sm font-medium ${
                      router.pathname == '/' ? 'border-amber-300' : ''
                    }`}
                  >
                    Wallet Top Up
                  </p>
                </Link>

                <Link href="/gas" aria-current="page">
                  <p
                    className={`hover:border-amber-300 border-transparent border-b-2 px-3 py-2 text-sm font-medium ${
                      router.pathname == '/gas' ? 'border-amber-300' : ''
                    }`}
                  >
                    Gas Top Up
                  </p>
                </Link>

                <Link href="/cauldron">
                  <p
                    className={`hover:border-amber-300 border-transparent border-b-2 px-3 py-2 text-sm font-medium ${
                      router.pathname == '/cauldron' ? 'border-amber-300' : ''
                    }`}
                  >
                    Cauldron Top Up
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMenu && (
        <div className="sm:hidden absolute top-50 left-0 bg-white w-full" id="mobile-menu" ref={mobileMenu}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div>
              <Link href="/" className="">
                <p
                  className={`my-5 hover:border-amber-300 border-transparent border-b-2 text-xl font-workSans ${
                    router.pathname == '/' ? 'border-amber-300' : ''
                  }`}
                >
                  WALLET TOP UP
                </p>
              </Link>
            </div>

            <div>
              <Link href="/gas" className="">
                <p
                  className={`hover:border-amber-300 border-transparent border-b-2 text-xl font-workSans ${
                    router.pathname == '/gas' ? 'border-amber-300' : ''
                  }`}
                >
                  GAS TOP UP
                </p>
              </Link>
            </div>

            <div>
              <Link href="/cauldron" className="">
                <p
                  className={`hover:border-amber-300 border-transparent border-b-2 text-xl font-workSans ${
                    router.pathname == '/cauldron' ? 'border-amber-300' : ''
                  }`}
                >
                  CAULDRON TOP UP
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
