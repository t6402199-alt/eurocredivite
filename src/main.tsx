import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Graceful global error handling to suppress third-party cross-origin and Google Translate script errors
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function (message, url, line, col, error) {
    const msgStr = String(message || '');
    const urlStr = String(url || '');
    if (
      msgStr.includes('Script error') ||
      msgStr.includes('Translate') ||
      urlStr.includes('translate.google') ||
      urlStr.includes('google.com')
    ) {
      console.warn('Suppressed third-party script/translate global error:', message, url);
      return true; // prevent default browser handling for this error
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const msgStr = String(event.message || '');
    const fileStr = String(event.filename || '');
    if (
      msgStr.includes('Script error') ||
      msgStr.includes('Translate') ||
      fileStr.includes('translate.google') ||
      fileStr.includes('google.com')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
      console.warn('Suppressed deep third-party script error event:', event.message);
    }
  }, true);

  // Also handle unhandled promise rejections from third-party scripts gracefully
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (reasonStr.includes('google') || reasonStr.includes('translate')) {
      event.stopImmediatePropagation();
      event.preventDefault();
      console.warn('Suppressed third-party unhandled promise rejection:', event.reason);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

