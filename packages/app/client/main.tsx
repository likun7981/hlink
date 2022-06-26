import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SWRConfig } from 'swr'
import 'antd/dist/antd.min.css'
import 'uno.css'
import './index.css'
import './userWorker'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SWRConfig value={{ dedupingInterval: 100 }}>
        <App />
      </SWRConfig>
    </React.StrictMode>
  )
}
