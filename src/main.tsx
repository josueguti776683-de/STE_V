import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Progressive Web App (PWA) Service Worker for full cell & laptop offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('TMA PWA Active - Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('TMA PWA Error - Service Worker registration failed:', error);
      });
  });
}

