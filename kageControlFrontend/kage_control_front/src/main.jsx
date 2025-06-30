import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './routes';
import { AuthProvider } from './hooks/useAuth';
import NotificacionesSocket from './components/NotificacionesSocket';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificacionesSocket />
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
