import React from "react";

import { NetworkErrorMessage } from "./NetworkErrorMessage";

import { ethers } from "ethers";

import contractAddress from "../contracts/contract-address.json";
import IKnewThatArtifact from "../contracts/IKnewThat.json";

const HARDHAT_NETWORK_ID = '31337';

async function connectWallet({ setIKnewThat }) {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
      const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const iKnewThat = new ethers.Contract(
      contractAddress.IKnewThat,
      IKnewThatArtifact.abi,
      provider.getSigner(0),
    );
    setIKnewThat(iKnewThat);
}



export function ConnectWallet({ setIKnewThat }) {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-6 p-4 text-center">
          <p>Please connect to your wallet.</p>
          <button
            className="btn btn-warning"
            type="button"
            onClick={() => connectWallet({ setIKnewThat })}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}