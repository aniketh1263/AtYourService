import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'

// This is where the app starts: find the <div id="root"> from index.html and let React draw inside it.
createRoot(document.getElementById('root')!).render(
  // StrictMode only runs in development. It deliberately renders components twice to help us catch bugs.
  <StrictMode>
    {/* BrowserRouter lets the app react to the URL (/history, /tickets...) without reloading the page. */}
    <BrowserRouter>
      {/* AuthProvider makes "who is logged in" available to every component below it. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
