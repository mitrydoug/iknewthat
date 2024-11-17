import { Helia } from '@helia/http';
import { ethers } from 'ethers';
import { createContext } from 'react';

export interface AppState {
    iKnewThat: ethers.Contract | null;
    helia: Helia | null;
    wallet: {
        provider: ethers.BrowserProvider | null,
        walletState: string,
        signer: ethers.Signer | null,
        address: string | null,
    };
}

export const AppContext = createContext<AppState | null>(null);