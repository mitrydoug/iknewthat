import { useState } from "react";
import { NoWalletDetected } from "./components/NoWalletDetected";
import { ConnectWallet } from "./components/ConnectWallet";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ErrorPage from "./error-page";
import Root, { lookup as indexLookup } from "./routes/root";
import Claim, { loader as claimLoader } from "./routes/claim";
import CreateClaim, { createClaim } from "./routes/create";
import RevealClaim, { revealClaim } from "./routes/reveal";


export default function App() {

  const [iKnewThat, setIKnewThat] = useState(null);


  if (window.ethereum === undefined) {
    return <NoWalletDetected />;
  }

  if (!iKnewThat) {
    return (
      <ConnectWallet
        setIKnewThat={setIKnewThat}
      />
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      action: indexLookup,
      children: [
        {
          path: "claim/:commitHash",
          element: <Claim />,
          loader: claimLoader(iKnewThat),
        },
        {
          path: "claim/create",
          element: <CreateClaim />,
          action: createClaim(iKnewThat),
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