import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

console.log('[DEBUG] React app starting...')

const rootElement = document.getElementById('root')
console.log('[DEBUG] Root element:', rootElement)

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('[DEBUG] React app mounted successfully')
} else {
  console.error('[DEBUG] Root element not found!')
}
