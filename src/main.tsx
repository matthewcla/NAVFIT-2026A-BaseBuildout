import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App'
// import { Phase1VerifierV2 } from './debug/Phase1VerifierV2';
// import { Phase2Verifier } from './debug/Phase2Verifier';
// import { Phase3VerifierV2 } from './debug/Phase3VerifierV2';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
