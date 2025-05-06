import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // ← Make sure this matches your CSS filename

ReactDOM
  .createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
