import React, { useState } from 'react';
import { Menu, X, Landmark, User, ShieldAlert, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation, Language, countries } from '../utils/translation';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAdmin: boolean;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
}

export default function Header({ currentPage, setCurrentPage, isAdmin, setIsAdminLoggedIn }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, lang, changeLanguage } = useTranslation();

  const navItems = [
    { id: 'accueil', label: t('nav.home') },
    { id: 'apropos', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
    { id: 'demande', label: t('nav.apply') },
  ];

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    setIsMenuOpen(false);
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('accueil');
  };

  return (
    <header id="site-header" className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <button
          id="logo-button"
          onClick={() => handleNavigate('accueil')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-teal-500/10">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900 leading-tight">CrediVite</span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-emerald-600 leading-none">Agence de Crédit</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none rounded-lg ${
                  isActive 
                    ? 'text-emerald-700 bg-emerald-50/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTAs and Admin Button */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                id="nav-admin-dashboard"
                onClick={() => handleNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  currentPage === 'admin' 
                    ? 'bg-slate-950 text-white border-slate-950'
                    : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Espace Admin (Actif)
              </button>
              <button
                id="nav-logout-admin"
                onClick={handleLogoutAdmin}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded-md transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}

          <button
            id="nav-cta-demande"
            onClick={() => handleNavigate('demande')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all active:scale-[0.98]"
          >
            {t('nav.apply')}
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <select
              id="language-select-desktop"
              value={lang}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[170px]"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Language Selector badge */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-lg px-2 py-1">
            <Globe className="h-3 w-3 text-slate-500" />
            <select
              id="language-select-mobile-badge"
              value={lang}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button
              id="mobile-admin-badge"
              onClick={() => handleNavigate('admin')}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600"
              title="Accéder au tableau de bord"
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="border-b border-slate-200 bg-white md:hidden overflow-hidden"
          >
            <div className="space-y-1.5 px-4 pt-2 pb-6">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => handleNavigate(item.id)}
                    className={`block w-full rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              <div className="my-4 border-t border-slate-100 pt-4 space-y-2">
                {isAdmin && (
                  <>
                    <button
                      id="mobile-admin-dashboard-link"
                      onClick={() => handleNavigate('admin')}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-800 bg-amber-50/55 border border-amber-100"
                    >
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Tableau de bord Admin en cours
                    </button>
                    <button
                      id="mobile-admin-logout"
                      onClick={handleLogoutAdmin}
                      className="block w-full text-left text-sm font-semibold text-rose-600 px-4 py-2"
                    >
                      Déconnexion Admin
                    </button>
                  </>
                )}

                <button
                  id="mobile-cta-demande"
                  onClick={() => handleNavigate('demande')}
                  className="block w-full text-center rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  Faire une demande de prêt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
