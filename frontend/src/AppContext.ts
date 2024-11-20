import { Helia } from '@helia/http';
import { ethers } from 'ethers';
import React from "react";
import { createContext } from 'react';

export interface AppState {
    iKnewThat: ethers.Contract | null;
    helia: Helia | null;
    wallet: {
        provider: ethers.BrowserProvider | null,
        walletState: string,
        signer: ethers.Signer | null,
        address: string | null,
        connectWallet: () => Promise<void>,
        connectionRequest: object | null,
        setConnectionRequest: React.Dispatch<React.SetStateAction<null>>,
    };
    requestConnection: () => void;
    connectionRequested: boolean;
}

export const AppContext = createContext<AppState | null>(null);