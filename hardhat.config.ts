import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
import "./tasks/faucet";

// Ensure your configuration variables are set before executing the script
const { vars } = require("hardhat/config");

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and add it to the configuration variables
const INFURA_API_KEY = vars.get("INFURA_API_KEY", null);

// Add your Sepolia account private key to the configuration variables
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY", null);

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    ... (INFURA_API_KEY && SEPOLIA_PRIVATE_KEY ?
      {
        arbitrumOne: {
          url: 'https://arb1.arbitrum.io/rpc',
          chainId: 42161,
          accounts: [SEPOLIA_PRIVATE_KEY],
        },
        arbitrumSepolia: {
          url: 'https://sepolia-rollup.arbitrum.io/rpc',
          chainId: 421614,
          accounts: [SEPOLIA_PRIVATE_KEY],
        },
      } : {}
    ),
  },
};

export default config;