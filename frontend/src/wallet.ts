
import React from "react";
import { useCallback, useState, useMemo } from "react";
import { ethers } from "ethers";

export const useWallet = () => {

    const [walletState, setWalletState] = useState("unknown");
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);
    const [connectionRequest, setConnectionRequest] = useState(null);
    
    // children can make a request though!
    //setConnectionRequest(null);

    const provider = useMemo(() => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            window.ethereum.on("accountsChanged", (accounts: Array<string>) => { setupWalletState(); });
            return provider;
        } else {
            return null;
        }
    }, [window.ethereum]);

    const setupWalletState = useCallback(async (connect=false) => {
        if (!provider) { return; }
    
        const setupConnect = async () => {
            const signer = await provider.getSigner();
            setSigner(signer);
            setWalletState("connected");
            const address = await signer.getAddress();
            setAddress(address);
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