import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import ErrorPage from "./error-page";

import Root from "./routes/root";
import Index, { lookup as indexLookup } from "./routes/index";
import Claim, { loader as claimLoader }from "./routes/claim";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
        action: indexLookup,
      },
      {
        path: "claim/:commitHash",
        element: <Claim />,
        loader: claimLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
