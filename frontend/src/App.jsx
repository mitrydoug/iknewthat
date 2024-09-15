import { useState, useMemo } from "react";
import { NoWalletDetected } from "./components/NoWalletDetected";
import { ConnectWallet } from "./components/ConnectWallet";

import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address.json";
import IKnewThatArtifact from "./contracts/IKnewThat.json";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { createHelia } from 'helia'

import ErrorPage from "./error-page";
import Root, { lookup as indexLookup } from "./routes/root";
import Claim from "./routes/claim";
import CreateClaim, { createClaim } from "./routes/create";
import RevealClaim, { revealClaim } from "./routes/reveal";
import { createVerifiedFetch } from "@helia/verified-fetch";
import { MemoryBlockstore } from 'blockstore-core';
import { Loading } from "./components/Loading";

export default function App() {

    if (window.ethereum === undefined) {
        return <NoWalletDetected />;
    }

    const provider = useMemo(() => { return new ethers.providers.Web3Provider(window.ethereum); });

    const [connState, setConnState] = useState("unknown");

    const iKnewThat = useMemo(() => {
        
        const iKnewThat = new ethers.Contract(
            contractAddress.IKnewThat,
            IKnewThatArtifact.abi,
            provider.getSigner(0),
        );
        return iKnewThat;
    }, [provider]);

    const [helia, setHelia] = useState(null);
    const [fetch, setFetch] = useState(null);

    const blockstore = useMemo(() => {
        return new MemoryBlockstore();
    });

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

    if(!fetch && !helia) {
        setHelia("helia");
        setFetch("fetch");
        createHelia({ blockstore }).then((helia) => {
            createVerifiedFetch(helia).then((fetch) => {
                console.log(fetch);
                setFetch(_ => fetch);
                setHelia(helia);
            });
        });
        return <Loading />;
    }

    console.log(fetch);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root />,
            errorElement: <ErrorPage />,
            action: indexLookup,
            children: [
                {
                    path: "claim/:p_commitHash",
                    element: <Claim iKnewThat={iKnewThat} helia={helia} fetch={fetch}/>,
                },
                {
                    path: "claim/id/:p_claimId",
                    element: <Claim iKnewThat={iKnewThat} helia={helia} fetch={fetch}/>,
                },
                {
                    path: "claim/create",
                    element: <CreateClaim />,
                    action: createClaim(iKnewThat, helia),
                },
                {
                    path: "claim/reveal",
                    element: <RevealClaim />,
                    action: revealClaim(iKnewThat),
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}