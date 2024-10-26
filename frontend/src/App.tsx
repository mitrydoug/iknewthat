import { useState, useMemo } from "react";
import { Button, Spin, Typography } from "antd";

const { Title, Paragraph, Text, Link } = Typography;

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
            <Title level={1}>Welcome to iKnewThat!</Title>
            <Paragraph>
                This site allows you to reveal information in the future, while proving you knew it as early as today. For example, suppose you manage an investment fund and want to enable your investors to verify your performance without giving away your edge. You could publish a daily claim on iKnewThat listing financial trades (if any) made that day, revealing each claim six months later. This way, anyone can verify your financial performance after the fact.
            </Paragraph>
            <Paragraph>
                This site is a distributed application (DApp) built on the <Link href="https://ethereum.org/" target="_blank">Ethereum blockchain</Link>. This means you don't have to trust me or any company to provide the facts. Rather, the iKnewThat DApp enables you to store facts on the blockchain, where they cannot be modified, and leverages Cryptography to enable the separation of the creation of a claim from its reveal.
            </Paragraph>
            <Title level={3}>How it Works</Title>
            <Paragraph>
                Search for claims by their claim id or commit hash. To create a claim, click <Text strong>Make Claim</Text>, give your claim a title, add a description, and optionally add any number of file attachments. The description field supports <Link href="https://commonmark.org/help/" target="_blank">Markdown</Link>. When you're ready, click Submit, click Ok, and confirm the resulting transaction using MetaMask. You'll be directed to a page for your newly created claim, but it will be "concealed". You will also notice a new download associated with your claim (a <Text code>.claim</Text> file). To reveal a claim, click <Text strong>Reveal Claim</Text> and select the <Text code>.claim</Text> associated with your claim, click Reveal, and confirm the resulting transaction using MetaMask. Only once you have revealed a claim can anyone see the details of your claim.
            </Paragraph>
            <Title level={3}>Disclaimer</Title>
            <Paragraph>
                This is an experimental site! It has not undergone a security audit. <b>You</b> bear full responsibility for transactions submitted to the network.
            </Paragraph>
            <Paragraph>
                Transactions with this application never involve payment of ETH; you should only need to pay gas fees. Take care when submitting transactions to Ethereum Mainnet.
            </Paragraph>
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