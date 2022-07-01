import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SWRConfig } from 'swr'
import 'uno.css'
import './index.less'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'

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
