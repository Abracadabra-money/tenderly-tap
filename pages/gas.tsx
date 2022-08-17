import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import GasManager from '../components/gasManager';
import React from 'react';
import Navbar from '../components/navbar';
import FlashMessage from '../components/flashMessage';
import { useState } from 'react';
import { FlashState } from '../helpers/interfaces';

const Gas: NextPage = () => {
  const [flashMessage, setFlashMessage] = useState<FlashState | undefined>(undefined);

  return (
    <div className={styles.container}>
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Tenderly faucet to quickly set up a fork." />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <title>The Tenderly Tap</title>
      </Head>

      <Navbar></Navbar>

      <FlashMessage setFlashMessage={setFlashMessage} flashMessage={flashMessage}></FlashMessage>

      <div className="mx-auto my-10 bg-amber-300">
        <div className="flex justify-center">
          <h1 className="logo font-workSans ml-5 py-10 svg-background">GET GAS</h1>
        </div>
      </div>

      <div className="container mx-auto">
        <GasManager setFlashMessage={setFlashMessage}></GasManager>
      </div>
    </div>
  );
};

export default Gas;
