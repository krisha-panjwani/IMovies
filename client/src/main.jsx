import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/theme.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'im-toast',
            success: { iconTheme: { primary: '#22C55E', secondary: '#0B0D12' } },
            error: { iconTheme: { primary: '#E3264B', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
