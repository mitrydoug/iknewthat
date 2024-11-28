import { useCallback, useState, useEffect } from "react";

import {
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query'

import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address.json";
import IKnewThatArtifact from "./contracts/IKnewThat.json";
import { AppContext } from "./AppContext" 

import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import { createHeliaHTTP } from '@helia/http'
import { delegatedHTTPRouting, httpGatewayRouting } from '@helia/routers'

import ErrorPage from "./error-page";
import Root from "./routes/root";
import Claim from "./routes/claim";
import CreateClaim from "./routes/create";
import RevealClaim  from "./routes/reveal";
import Index from "./routes/index";
import About from "./routes/about";
import { useWallet } from "./wallet";

const baseUrl = import.meta.env.BASE_URL;

export default function App() {

    const wallet = useWallet();
    const { provider, walletState, network } = wallet;
    const [helia, setHelia] = useState(null);
    const [iKnewThat, setIKnewThat] = useState(null);
    const [connectionRequested, setConnectionRequested] = useState(false);

    const requestConnection = useCallback(() => {
        setConnectionRequested(true);
    }, []);

    useEffect(() => {
        if (provider && walletState === "connected") {
            console.log(contractAddress);
            console.log(network);
            provider.getSigner().then(signer => {
                setIKnewThat(
                    new ethers.Contract(
                        contractAddress.IKnewThat[network],
                        IKnewThatArtifact.abi,
                        signer,
                    )
                );
            });
        }
    }, [walletState, network]);

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

    const routes = [
        {
            path: "/",
            element: <Root/>,
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <Index />,
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
                {
                    path: "about",
                    element: <About />,
                },
            ],
        },
    ];
    const router = createHashRouter(routes);
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppContext.Provider value={{ iKnewThat, helia, wallet }}>
                <RouterProvider router={router} />
            </AppContext.Provider>
        </QueryClientProvider>
    );
}