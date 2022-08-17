import axios from 'axios';
import * as dotenv from 'dotenv';
import { findKey } from 'underscore';

dotenv.config();

const opts = {
  headers: {
    'X-Access-Key': process.env.TENDERLY_ACCESS_KEY!,
  },
};

dotenv.config(); // load environment variables using dotenv

async function main() {
  const config = require('../configs/chains.json');
  let key = findKey(config, (data) => {
    return data.chainId == '1';
  });
  console.log(key);
}

main();
