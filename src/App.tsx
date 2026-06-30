import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Accueil from './components/Accueil';
import APropos from './components/APropos';
import Contact from './components/Contact';
import DemandePret from './components/DemandePret';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation State: 'accueil', 'apropos', 'contact', 'demande', 'admin'
  const [currentPage, setCurrentPage] = useState<string>('accueil');
  
  // Login persist indicators for demonstration Admin space
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Transfer selections out of home simulator directly to the application card step
  const [presetLoanDetails, setPresetLoanDetails] = useState<{
    montant: number;
    objet: string;
    duree: number;
    devise: string;
  } | null>(null);

  // Google Translate programmatic trigger
  useEffect(() => {
    // 1. Add css styling to perfectly hide google translate top bar and balloon widgets
    const style = document.createElement('style');
    style.innerHTML = `
      iframe.goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0px !important;
      }
      .goog-te-balloon-frame, .goog-tooltip, .goog-tooltip:hover, .goog-te-tip, .goog-te-clean-layout {
        display: none !important;
      }
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      #google_translate_element {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Set up the target div
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    document.body.appendChild(gtDiv);

    // 3. Define translate callback
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'fr',
        autoDisplay: false
      }, 'google_translate_element');
    };

    // 4. Load translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    // Helper translation applicator
    const applyTranslation = () => {
      const savedLang = localStorage.getItem('app_language') || 'FR';
      const langCode = savedLang.toLowerCase();

      let attempts = 0;
      const runSelection = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = langCode === 'fr' ? '' : langCode;
          select.dispatchEvent(new Event('change'));
        } else if (attempts < 50) {
          attempts++;
          setTimeout(runSelection, 150);
        }
      };
      runSelection();
    };

    // Listen to changes and sync on init
    window.addEventListener('app_language_change', applyTranslation);
    
    // Initial delay trigger
    const initialTimer = setTimeout(applyTranslation, 1000);

    return () => {
      window.removeEventListener('app_language_change', applyTranslation);
      clearTimeout(initialTimer);
      if (document.head.contains(style)) document.head.removeChild(style);
      if (document.body.contains(gtDiv)) document.body.removeChild(gtDiv);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Sync Google Translate whenever the view changes to translate new components
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('app_language_change'));
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const renderActiveView = () => {
    switch (currentPage) {
      case 'accueil':
        return (
          <Accueil 
            setCurrentPage={setCurrentPage} 
            setPresetLoanDetails={setPresetLoanDetails} 
          />
        );
      case 'apropos':
        return <APropos />;
      case 'contact':
        return <Contact />;
      case 'demande':
        return (
          <DemandePret
            presetDetails={presetLoanDetails}
            clearPreset={() => setPresetLoanDetails(null)}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            isAdminLoggedIn={isAdminLoggedIn} 
            setIsAdminLoggedIn={setIsAdminLoggedIn} 
          />
        );
      default:
        return <Accueil setCurrentPage={setCurrentPage} setPresetLoanDetails={setPresetLoanDetails} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isAdmin={isAdminLoggedIn} 
        setIsAdminLoggedIn={setIsAdminLoggedIn} 
      />

      {/* Main views transitions container */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Corporate footer */}
      <Footer setCurrentPage={setCurrentPage} />
      
    </div>
  );
}
