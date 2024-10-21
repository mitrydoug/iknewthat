import React from "react";
import { useState, useMemo } from "react";
import { Button, Spin } from "antd";

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
import CreateClaim from "./routes/create";
import RevealClaim  from "./routes/reveal";

const baseUrl = import.meta.env.BASE_URL;

export default function App() {

    const [connState, setConnState] = useState("unknown");
    const [helia, setHelia] = useState(null);
    const [iKnewThat, setIKnewThat] = useState(null);
    
    const provider = useMemo(() => {
        if (window.ethereum) {
            return new ethers.BrowserProvider(window.ethereum);
        } else {
            return null;
        }
    }, [window.ethereum]);

    const initContract = (signer) => {
        setIKnewThat(
            new ethers.Contract(
                contractAddress.IKnewThat,
                IKnewThatArtifact.abi,
                signer,
            )
        );
    };

    if (connState == "unknown" && provider !== null) {
        provider.listAccounts().then((accounts) => {
            if (accounts.length === 0) {
                setConnState("not_connected");
            } else {
                setConnState("connected");
            }
        });
    }

    if (iKnewThat === null && provider !== null && connState === "connected") {
        provider.getSigner().then(signer => initContract(signer));
    }

    console.log(iKnewThat);

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

    const homeElem = provider === null ? (
        <>
            <p>No wallet detected. Create an account with <a href="https://metamask.io/">MetaMask</a> and install their browser extension.</p>
        </>
    ) : connState === "unknown" ? (
        <Spin />
    ) : connState === "not_connected" ? (
        <Button
          type="primary"
          onClick={() => { provider.getSigner().then(signer => initContract(signer)) }}>
            Connect Wallet
        </Button>
    ) : (
        <>
            <h1>Welcome!</h1>
            <p>This is an experimental site!</p>
        </>
    );


    const routes = [
        {
            path: "/",
            element: <Root />,
            errorElement: <ErrorPage />,
            action: indexLookup,
            children: [
                {
                    index: true,
                    element: homeElem,
                },
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
    ];
    const router = createBrowserRouter(routes, { basename: baseUrl });
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppContext.Provider value={{ iKnewThat, helia }}>
                <RouterProvider router={router} />
            </AppContext.Provider>
        </QueryClientProvider>
    );
}