import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/context/AuthContext';
import { CampusProvider } from '@/context/CampusContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { bootstrapDeepLinks } from '@/lib/router';

// Doit s'exécuter avant le premier rendu : traduit un lien physique de QR
// code (/qr/:code) en route interne (#/qr-scan?code=...).
bootstrapDeepLinks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <CampusProvider>
          <App />
        </CampusProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);
