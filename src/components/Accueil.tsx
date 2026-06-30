import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Zap, HandCoins, Users, BarChart3, Star, Quote, 
  ChevronRight, Landmark, Home, Car, Construction, Percent, ChevronDown, ChevronUp, Table
} from 'lucide-react';
import { useTranslation } from '../utils/translation';

import thomasAvatar from '../assets/images/thomas_avatar_1780584801194.png';
import sebastienAvatar from '../assets/images/sebastien_avatar_1780584817659.png';
import nadiaAvatar from '../assets/images/nadia_avatar_1780584835486.png';

interface AccueilProps {
  setCurrentPage: (page: string) => void;
  setPresetLoanDetails: (details: { montant: number; objet: string; duree: number; devise: string }) => void;
}

interface LoanType {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultRate: number; // Annuel
  minAmount: number;
  maxAmount: number;
  minDuration: number; // in months
  maxDuration: number; // in months
  description: string;
  features: string[];
}

export default function Accueil({ setCurrentPage, setPresetLoanDetails }: AccueilProps) {
  // Types of loan available
  const loanTypes: LoanType[] = [
    {
      id: 'Immobilier',
      title: 'Prêt Immobilier',
      icon: <Home className="h-6 w-6" />,
      defaultRate: 1.70,
      minAmount: 2000,
      maxAmount: 200000,
      minDuration: 12,
      maxDuration: 120,
      description: 'Financez l’achat de votre résidence principale, secondaire ou un investissement locatif.',
      features: ['Financement jusqu’à 110%', 'Modulation gratuite des mensualités', 'Taux fixe garanti']
    },
    {
      id: 'Automobile',
      title: 'Prêt Auto / Moto',
      icon: <Car className="h-6 w-6" />,
      defaultRate: 2.90,
      minAmount: 2000,
      maxAmount: 200000,
      minDuration: 12,
      maxDuration: 120,
      description: 'Achetez votre véhicule neuf ou d’occasion avec des conditions de remboursement optimales.',
      features: ['Déblocage rapide', 'Remboursement anticipé partiel ou total']
    },
    {
      id: 'Travaux',
      title: 'Prêt Travaux & Déco',
      icon: <Construction className="h-6 w-6" />,
      defaultRate: 2.40,
      minAmount: 2000,
      maxAmount: 200000,
      minDuration: 12,
      maxDuration: 120,
      description: 'Rénovation énergétique, extension, aménagement extérieur ou simple décoration.',
      features: ['Financement sur devis', 'Accompagnement d’experts', 'Taux bonifié écologique']
    },
    {
      id: 'Consommation',
      title: 'Crédit Consommation',
      icon: <HandCoins className="h-6 w-6" />,
      defaultRate: 4.10,
      minAmount: 2000,
      maxAmount: 200000,
      minDuration: 12,
      maxDuration: 120,
      description: 'Financez vos projets personnels (mariage, voyage, études, équipement) en toute liberté.',
      features: ['Sans justificatif d’utilisation', 'Réponse immédiate']
    },
  ];

  const devises = ['EUR', 'USD', 'CHF', 'CAD', 'GBP', 'JPY', 'AUD', 'MAD', 'XOF'] as const;

  // Simulator state
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>(loanTypes[3]);
  const [amount, setAmount] = useState<number>(2000);
  const [duration, setDuration] = useState<number>(36); // 3 ans
  const [selectedDevise, setSelectedDevise] = useState<string>('EUR');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const { t, lang } = useTranslation();
  
  // Calculations
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalRepay, setTotalRepay] = useState<number>(0);

  // Auto adjust bounds when type changes
  useEffect(() => {
    // Keep amount within type boundaries
    if (amount < selectedLoanType.minAmount) {
      setAmount(selectedLoanType.minAmount);
    } else if (amount > selectedLoanType.maxAmount) {
      setAmount(selectedLoanType.maxAmount);
    }

    // Keep duration within type boundaries
    if (duration < selectedLoanType.minDuration) {
      setDuration(selectedLoanType.minDuration);
    } else if (duration > selectedLoanType.maxDuration) {
      setDuration(selectedLoanType.maxDuration);
    }
  }, [selectedLoanType]);

  // Performs core banking payment formula on changes
  useEffect(() => {
    const rate = selectedLoanType.defaultRate / 100;
    const monthlyRate = rate / 12;
    
    // Formula: M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    let payment = 0;
    if (monthlyRate === 0) {
      payment = amount / duration;
    } else {
      payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
    }

    const totalToPay = payment * duration;
    const cost = totalToPay - amount;

    setMonthlyPayment(Math.round(payment * 100) / 100);
    setTotalRepay(Math.round(totalToPay * 100) / 100);
    setTotalCost(Math.round(cost * 100) / 100);
  }, [amount, duration, selectedLoanType]);

  const handleApplyPreset = () => {
    setPresetLoanDetails({
      montant: amount,
      objet: selectedLoanType.id,
      duree: duration,
      devise: selectedDevise
    });
    setCurrentPage('demande');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDeviseSymbol = (devId: string) => {
    switch(devId) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'CHF': return 'CHF';
      case 'CAD': return 'C$';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'AUD': return 'A$';
      case 'MAD': return 'DH';
      case 'XOF': return 'FCFA';
      default: return '€';
    }
  };

  const getCategoryTranslation = (id: string, defTitle: string) => {
    switch (id) {
      case 'Immobilier': return t('cat.immo');
      case 'Automobile': return t('cat.auto');
      case 'Travaux': return t('cat.trav');
      case 'Consommation': return t('cat.cons');
      default: return defTitle;
    }
  };

  const advantages = [
    {
      title: t('about.val1.title'),
      description: t('about.val1.desc'),
      icon: <Users className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Taux ultra compétitifs',
      description: 'Grâce à des partenariats solidement établis avec les plus grandes banques nationales, nous négocions le meilleur TAEG du marché.',
      icon: <Percent className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Traitement accéléré',
      description: 'Déposez votre dossier 100% en ligne en moins de 10 minutes. Une pré-acceptation de principe vous est délivrée immédiatement.',
      icon: <Zap className="h-6 w-6 text-emerald-600" />
    }
  ];

  const testimonials = [
    {
      name: 'Thomas & Laure G.',
      role: 'Acquéreurs immobiliers',
      quote: 'Grâce au conseiller de CrediVite, nous avons obtenu notre accord de prêt immobilier à un taux incroyable de 3.25% en moins de deux semaines. Un accompagnement exceptionnel, chaleureux et rigoureux !',
      rating: 5,
      avatarBg: 'bg-emerald-100 text-emerald-800',
      avatarUrl: thomasAvatar
    },
    {
      name: 'Sébastien L.',
      role: 'Financement auto',
      quote: 'Rapide, efficace et totalement transparent. J’ai pu acheter ma voiture d’occasion sans passer des heures à la banque. Envoi des justificatifs simples par glisser-déposer sur le site, réponse en 24h !',
      rating: 5,
      avatarBg: 'bg-teal-100 text-teal-800',
      avatarUrl: sebastienAvatar
    },
    {
      name: 'Nadia M.',
      role: 'Prêt Travaux Réno-Énergie',
      quote: 'L’engagement de l’agence sur les taux d’éco-rénovation est bien réel! J’ai pu financer l’intégralité de mes panneaux solaires et de l’isolation thermique rapidement. Entreprise humaine et sérieuse.',
      rating: 5,
      avatarBg: 'bg-indigo-100 text-indigo-800',
      avatarUrl: nadiaAvatar
    }
  ];

  return (
    <div id="home-view" className="bg-slate-50">
      
      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden bg-white py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.teal.50),white)] opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <Landmark className="h-3.5 w-3.5" />
                {t('nav.slogan')}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl max-w-xl mx-auto lg:mx-0 leading-tight">
                {t('hero.title')}<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('hero.subtitle')}</span>
              </h1>
              <p className="text-base text-slate-600 max-w-lg mx-auto lg:mx-0">
                {t('hero.desc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="hero-cta-demande"
                  onClick={() => {
                    setCurrentPage('demande');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  {t('nav.apply')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="hero-cta-contact"
                  onClick={() => {
                    setCurrentPage('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t('nav.contact')}
                </button>
              </div>

              {/* Basic badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-slate-100">
                <div>
                  <span className="block text-xl font-bold text-slate-900">24h</span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Réponse</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">100%</span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Online</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">4.9/5</span>
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Avis</span>
                </div>
              </div>
            </div>

            {/* Right side Simulator (Visual masterpiece) */}
            <div className="lg:col-span-6 w-full max-w-xl mx-auto">
              <div id="interactive-simulator-card" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
                
                <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  {t('calc.title')}
                </h2>

                {/* Devise choice */}
                <div className="mb-4 flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 pl-2">{t('calc.currency')}</span>
                  <div className="flex gap-1.5">
                    {devises.map(dev => (
                      <button
                        key={dev}
                        id={`simulator-devise-${dev}`}
                        onClick={() => setSelectedDevise(dev)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                          selectedDevise === dev 
                            ? 'bg-slate-900 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {dev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid segment selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                  {loanTypes.map((type) => (
                    <button
                      key={type.id}
                      id={`simulator-type-${type.id}`}
                      onClick={() => setSelectedLoanType(type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        selectedLoanType.id === type.id
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/10'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="mb-1">{type.icon}</div>
                      <span className="text-[10px] sm:text-xs font-semibold truncate leading-none">{getCategoryTranslation(type.id, type.title)}</span>
                    </button>
                  ))}
                </div>

                {/* Amount details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-semibold text-slate-700">{t('calc.amount')}</label>
                    <span className="text-xl font-extrabold text-slate-900 font-mono notranslate">
                      <span>{amount.toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    id="simulator-amount-slider"
                    min={selectedLoanType.minAmount}
                    max={selectedLoanType.maxAmount}
                    step={selectedLoanType.id === 'Immobilier' ? 5000 : 500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 notranslate"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono notranslate">
                    <span><span>{selectedLoanType.minAmount.toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                    <span><span>{selectedLoanType.maxAmount.toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                  </div>
                </div>

                {/* Duration details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-semibold text-slate-700">{t('calc.duration')}</label>
                    <span className="text-lg font-bold text-slate-950 font-mono">
                      <span className="notranslate">{duration}</span> <span>{t('calc.period')}</span> <span className="text-xs text-slate-500 font-normal">(<span className="notranslate">{Math.round((duration/12)*10)/10}</span> <span>{t('calc.years')}</span>)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    id="simulator-duration-slider"
                    min={selectedLoanType.minDuration}
                    max={selectedLoanType.maxDuration}
                    step={selectedLoanType.id === 'Immobilier' ? 12 : 6}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 notranslate"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span className="notranslate"><span>{selectedLoanType.minDuration}</span> <span>{t('calc.period')}</span></span>
                    <span className="notranslate"><span>{selectedLoanType.maxDuration}</span> <span>{t('calc.period')}</span></span>
                  </div>
                </div>

                {/* Simulation Output Area */}
                <div className="rounded-2xl bg-emerald-950 p-5 text-white shadow-inner mb-6 relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-6 h-28 w-28 bg-emerald-800/10 rounded-full" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-emerald-300 font-medium">{t('calc.monthly')}</span>
                      <span className="text-2xl font-black font-mono">
                        <span className="notranslate">{monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span className="notranslate"> {getDeviseSymbol(selectedDevise)}</span>
                        <span className="text-xs text-emerald-300 font-normal"> /<span>{t('calc.period').substring(0,2)}</span></span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-emerald-300 font-medium">{t('calc.interest')}</span>
                      <span className="text-xl font-bold font-mono text-emerald-200 notranslate"><span>{selectedLoanType.defaultRate}</span> %</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-emerald-900/60 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-emerald-400">{t('calc.cost')}</span>
                      <span className="font-bold text-emerald-100 font-mono notranslate"><span>{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                    </div>
                    <div>
                      <span className="block text-emerald-400">{t('calc.total')}</span>
                      <span className="font-bold text-emerald-100 font-mono notranslate"><span>{totalRepay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                    </div>
                  </div>
                </div>

                {/* Detailed Amortization Table Toggle */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full inline-flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Table className="h-4 w-4 text-emerald-600" />
                      {showSchedule ? t('calc.schedule.hide') : t('calc.schedule.show')}
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 font-mono">
                      <span>{duration}</span> <span>{t('calc.period')}</span>
                      {showSchedule ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showSchedule && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white shadow-inner">
                          {/* Headers */}
                          <div className="grid grid-cols-5 gap-1 bg-slate-900 text-white px-3 py-2 text-[10px] font-bold text-center uppercase tracking-wider font-mono">
                            <span>{t('table.month')}</span>
                            <span>{t('table.paid')}</span>
                            <span>{t('table.interest')}</span>
                            <span>{t('table.capital')}</span>
                            <span>{t('table.balance')}</span>
                          </div>

                          {/* Scrollable list */}
                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 font-mono text-[10px] text-slate-600">
                            {(() => {
                              const rate = selectedLoanType.defaultRate / 100;
                              const monthlyRate = rate / 12;
                              let balance = amount;
                              const rows = [];
                              
                              let payment = 0;
                              if (monthlyRate === 0) {
                                payment = amount / duration;
                              } else {
                                payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
                              }

                              for (let m = 1; m <= duration; m++) {
                                const interest = balance * monthlyRate;
                                let principal = payment - interest;
                                if (m === duration) {
                                  principal = balance;
                                  payment = principal + interest;
                                }
                                const endingBalance = balance - principal;
                                rows.push(
                                  <div key={m} className="grid grid-cols-5 gap-1 px-3 py-1.5 text-center hover:bg-slate-50 transition-colors">
                                    <span className="font-bold text-slate-900"><span>{m}</span></span>
                                    <span><span>{Math.round(payment).toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                                    <span><span>{Math.round(interest).toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                                    <span><span>{Math.round(principal).toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                                    <span className="font-semibold text-emerald-700"><span>{Math.round(Math.max(0, endingBalance)).toLocaleString()}</span><span> {getDeviseSymbol(selectedDevise)}</span></span>
                                  </div>
                                );
                                balance = endingBalance;
                              }
                              return rows;
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulator CTA */}
                <button
                  id="simulator-cta-apply"
                  onClick={handleApplyPreset}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  {t('calc.apply')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Description des Prêts */}
      <section id="loan-description-section" className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-emerald-600 text-xs">Des offres de crédit transparentes</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Découvrez nos solutions adaptées</h3>
            <p className="text-slate-600 mt-3">Profitez d'un crédit négocié, d'une flexibilité de remboursement et d'une prise en charge attentive de votre dossier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loanTypes.map((type) => (
              <div
                key={type.id}
                id={`loan-card-${type.id}`}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{type.title}</h4>
                      <span className="text-xs font-semibold text-slate-500">Taux fixe à partir de <strong className="text-emerald-600">{type.defaultRate}%</strong></span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {type.description} En tant que courtier expert, nous sollicitons nos partenaires institutionnels pour vous faire bénéficier d’une offre préférentielle et simplifiée.
                  </p>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Points forts de l'offre :</h5>
                  <ul className="space-y-2 mb-4">
                    {type.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    id={`loan-card-cta-${type.id}`}
                    onClick={() => {
                      setSelectedLoanType(type);
                      setAmount(type.minAmount * 1.5);
                      setDuration(type.minDuration + Math.round((type.maxDuration - type.minDuration) / 3));
                      const el = document.getElementById('interactive-simulator-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Obtenir cette offre
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages de l'agence */}
      <section id="advantages-section" className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(35rem_35rem_at_bottom_left,theme(colors.slate.900),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Aspect intro */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pourquoi CrediVite ?</span>
              <h3 className="text-3xl font-extrabold text-white">L'excellence du service de courtage</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Notre engagement est simple : vous obtenir les meilleures conditions financières d’octroi tout en vous déchargeant de la lenteur administrative des réseaux bancaires traditionnels.
              </p>
              <div className="pt-4">
                <button
                  id="advantages-cta-contact"
                  onClick={() => {
                    setCurrentPage('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  En savoir plus sur nos valeurs
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Advantages grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {advantages.map((adv, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3.5 hover:border-slate-700 transition-colors">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 border border-slate-800">
                    {adv.icon}
                  </div>
                  <h4 className="text-base font-bold text-slate-100">{adv.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{adv.description}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* Témoignages clients */}
      <section id="testimonials-section" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Vos retours d’expérience</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Plus de 5 000 clients financés</h3>
            <p className="text-slate-600 mt-3 text-sm">Découvrez les retours authentiques de clients qui ont financé leurs projets de vie grâce à CrediVite.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 relative flex flex-col justify-between">
                <div className="absolute top-6 right-6 text-slate-200">
                  <Quote className="h-8 w-8 text-emerald-500/10 shrink-0" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3">
                  {test.avatarUrl ? (
                    <img 
                      src={test.avatarUrl} 
                      alt={test.name} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-200/80 shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${test.avatarBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {test.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{test.name}</span>
                    <span className="block text-xs text-slate-500 font-medium">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secure disclaimer for financial regulations */}
          <div className="mt-16 text-center text-slate-400 text-xs">
            Certifications certifiées par Trustpilot. CrediVite s'engage à n'afficher que des témoignages d'utilisateurs réels ayant concrétisé leur financement.
          </div>

        </div>
      </section>

    </div>
  );
}
