import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthContextProvider } from './context/AuthContext'
import { PhotosContextProvider } from './context/PhotosContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <PhotosContextProvider>
        <App />
      </PhotosContextProvider>
    </AuthContextProvider>
  </StrictMode>,
)
