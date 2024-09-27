import { useState, useMemo } from "react";
import { NoWalletDetected } from "./components/NoWalletDetected";
import { ConnectWallet } from "./components/ConnectWallet";

import {
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query'

import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address.json";
import IKnewThatArtifact from "./contracts/IKnewThat.json";
import { AppContext } from "./AppContext" 

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { createHeliaHTTP } from '@helia/http'
import { delegatedHTTPRouting, httpGatewayRouting } from '@helia/routers'

import ErrorPage from "./error-page";
import Root, { lookup as indexLookup } from "./routes/root";
import Claim from "./routes/claim";
import CreateClaim, { createClaim } from "./routes/create";
import RevealClaim, { revealClaim } from "./routes/reveal";
import { createVerifiedFetch } from "@helia/verified-fetch";
import { MemoryBlockstore } from 'blockstore-core';
import { Loading } from "./components/Loading";

export default function App() {

    const [connState, setConnState] = useState("unknown");
    const [fetch, setFetch] = useState(null);
    const [helia, setHelia] = useState(null);
    
    const provider = useMemo(() => {
        if (window.ethereum) {
            return new ethers.providers.Web3Provider(window.ethereum);
        } else {
            return null;
        }
    }, [window.ethereum]);

    const iKnewThat = useMemo(() => {

        if (provider === null) {
            return null;
        }
        
        const iKnewThat = new ethers.Contract(
            contractAddress.IKnewThat,
            IKnewThatArtifact.abi,
            provider.getSigner(0),
        );
        return iKnewThat;
    }, [provider]);

    const blockstore = useMemo(() => {
        return new MemoryBlockstore();
    });

    const queryClient = new QueryClient()

    if (connState == "unknown") {
        
        provider.listAccounts().then((accounts) => {
            if (accounts.length === 0) {
                setConnState("not_connected");
            } else {
                setConnState("connected");
            }
        });

        return <Loading />;
    } else if (connState == "not_connected") {
        return <ConnectWallet setConnState={setConnState}/>;
    }

    if (window.ethereum === undefined) {
        return <NoWalletDetected />;
    }

    if(!helia) {
        createHeliaHTTP({
          routers: [
            delegatedHTTPRouting('https://delegated-ipfs.dev'),
            httpGatewayRouting({
              gateways: ['https://w3s.link', 'https://trustless-gateway.link']
            }),
          ]
        }).then((helia) => {
          setHelia(helia);
        });
    }

    console.log(helia);

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root />,
            errorElement: <ErrorPage />,
            action: indexLookup,
            children: [
                {
                    path: "claim/:p_commitHash",
                    element: <Claim/>,
                },
                {
                    path: "claim/id/:p_claimId",
                    element: <Claim/>,
                },
                {
                    path: "claim/create",
                    element: <CreateClaim/>,
                },
                {
                    path: "claim/reveal",
                    element: <RevealClaim />,
                },
            ],
        },
    ]);

    return (
        <QueryClientProvider client={queryClient}>
            <AppContext.Provider value={{ iKnewThat, helia }}>
                <RouterProvider router={router} />
            </AppContext.Provider>
        </QueryClientProvider>
        
    );
}