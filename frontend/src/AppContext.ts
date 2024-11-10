import { Helia } from '@helia/http';
import { ethers } from 'ethers';
import { createContext } from 'react';

export interface AppState {
    iKnewThat: ethers.Contract | null;
    helia: Helia | null;
    provider: ethers.BrowserProvider | null;
}

export const AppContext = createContext<AppState | null>(null);