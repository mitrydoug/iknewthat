
import { useCallback, useState, useMemo } from "react";
import { ethers } from "ethers";
import { set } from "@web3-storage/w3up-client/dist/src/capability/plan";



export const useWallet = () => {

    const [walletState, setWalletState] = useState("unknown");
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);

    const provider = useMemo(() => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            window.ethereum.on("accountsChanged", (accounts: Array<string>) => { setupWalletState(); });
            return provider;
        } else {
            return null;
        }
    }, [window.ethereum]);

    const setupWalletState = useCallback((connect=false) => {
        if (!provider) { return; }
    
        const setupConnect = async () => {
            const signer = await provider.getSigner();
            setSigner(signer);
            setWalletState("connected");
            const address = await signer.getAddress();
            setAddress(address);
        }
    
        if (connect) {
            setupConnect();
        } else {
            provider.listAccounts().then((accounts) => {
                if (accounts.length === 0) {
                    setWalletState("not_connected");
                    setSigner(null);
                    setAddress(null);
                } else {
                    setupConnect();
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
    }
}