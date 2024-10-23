import { Helia } from '@helia/http';
import { ethers } from 'ethers';
import { createContext } from 'react';

export interface AppState {
    iKnewThat: ethers.Contract;
    helia: Helia;
}

export const AppContext = createContext<AppState | null>(null);