
import React from "react";
import { useCallback, useState, useMemo } from "react";
import { ethers } from "ethers";

export const useWallet = () => {

    const [walletState, setWalletState] = useState("unknown");
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);
    const [connectionRequest, setConnectionRequest] = useState(null);

    const provider = useMemo(() => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            window.ethereum.on("accountsChanged", (accounts: Array<string>) => { setupWalletState(); });
            window.ethereum.on("chainChanged", (chainId: string) => { setupWalletState(); });
            return provider;
        } else {
            return null;
        }
    }, [window.ethereum]);

    const setupWalletState = useCallback(async (connect=false) => {
        if (!provider) { return; }
    
        const setupConnect = async () => {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setSigner(signer);
            setAddress(address);

            let network = await provider.getNetwork();
            if (! [
                  /* Arbitrum Mainnet */ BigInt(42161),
                  /* Arbitrum Sepolia */ BigInt(421614),
                  /* Hardhat Network */  BigInt(31337)
                ].includes(network.chainId)) {

                try {
                    // check if the chain to connect to is installed
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xA4B1' }],
                    });
                } catch (error) {
                    console.error(error);
                    setWalletState("wrong_network");
                    return;
                }
            }
            setWalletState("connected");
        }
    
        if (connect) {
            await setupConnect();
        } else {
            provider.listAccounts().then(async (accounts) => {
                if (accounts.length === 0) {
                    setWalletState("not_connected");
                    setSigner(null);
                    setAddress(null);
                } else {
                    await setupConnect();
                }
            });
        }
    }, [provider]);

    if (walletState == "unknown") {
        setupWalletState();
    }

    const connectWallet = async () => {
        setupWalletState(true);
    }

    return {
        connectWallet,
        provider,
        signer,
        address,
        walletState,
        connectionRequest,
        setConnectionRequest,
    }
}