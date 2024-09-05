import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import ErrorPage from "./error-page";

// import 'bootstrap/dist/css/bootstrap.min.css';

import App from "./App";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
