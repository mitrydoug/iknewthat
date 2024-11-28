import { useCallback, useState, useMemo } from "react";
import { ethers } from "ethers";
import { set } from "@web3-storage/w3up-client/dist/src/capability/plan";

const ARBITRUM_CHAIN_ID = BigInt(42161);
const ARBITRUM_TESTNET_CHAIN_ID = BigInt(421614);
const HARDHAT_CHAIN_ID = BigInt(31337);

export const useWallet = () => {

    const [walletState, setWalletState] = useState("unknown");
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);
    const [network, setNetwork] = useState(null);
    const [connectionRequest, setConnectionRequest] = useState(null);

    const provider = useMemo(() => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum, "any");
            window.ethereum.on("accountsChanged", (accounts: Array<string>) => { setupWalletState(); });
            window.ethereum.on("chainChanged", (chainId: string) => { window.location.reload(); });
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
            console.log(network.chainId);
            if (! [ARBITRUM_CHAIN_ID, ARBITRUM_TESTNET_CHAIN_ID, HARDHAT_CHAIN_ID].includes(network.chainId)) {

                try {
                    // check if the chain to connect to is installed
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xA4B1' }],
                    });
                } catch (error) {
                    console.error(error);
                    setWalletState("wrong_network");
                }
            }
            network = await provider.getNetwork();
            setWalletState("connected");
            setNetwork(network.chainId === ARBITRUM_CHAIN_ID ? "main" : network.chainId === ARBITRUM_TESTNET_CHAIN_ID ? "test" : network.chainId === HARDHAT_CHAIN_ID ? "hardhat" : "unsupported"); 
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
        network,
        walletState,
        connectionRequest,
        setConnectionRequest,
    }
}