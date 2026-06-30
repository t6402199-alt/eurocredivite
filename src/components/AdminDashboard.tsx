import React, { useState, useEffect } from 'react';
import { 
  getLoanRequests, saveLoanRequests, getContactMessages, saveContactMessages, 
  getEmailNotifications, saveEmailNotifications, mockSendEmailNotification 
} from '../services/api';
import { LoanRequest, ContactMessage, EmailNotification, DocumentFile } from '../types';
import { 
  ShieldCheck, Landmark, Lock, Users, BarChart3, Mail, RefreshCw, FileText, 
  Clock, CheckCircle, XCircle, Search, Filter, ArrowRight, Eye, Phone, MessageSquare, 
  Download, FileSpreadsheet, KeyRound, AlertCircle, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
}

export default function AdminDashboard({ isAdminLoggedIn, setIsAdminLoggedIn }: AdminDashboardProps) {
  // Login credentials state
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard states loaded from API
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  
  // Filtering & search
  const [activeTab, setActiveTab] = useState<'loans' | 'messages' | 'documents' | 'emails'>('loans');
  const [loanFilter, setLoanFilter] = useState<'Tous' | 'En attente' | 'En cours' | 'Accepté' | 'Refusé'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details modal state
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');

  // Image/Document viewer preview modal state
  const [previewDocument, setPreviewDocument] = useState<{
    file: DocumentFile;
    ownerName: string;
    category: string;
  } | null>(null);

  // Load backend data from the localStorage manager
  useEffect(() => {
    if (isAdminLoggedIn) {
      setLoanRequests(getLoanRequests());
      setContactMessages(getContactMessages());
      setNotifications(getEmailNotifications());
    }
  }, [isAdminLoggedIn]);

  // Handle credentials assessment
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'admin') {
      setIsAdminLoggedIn(true);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('Mot de passe de démonstration erroné. Veuillez saisir "admin123" ou "admin".');
    }
  };

  // Status alteration handler
  const handleUpdateStatus = (requestId: string, newStatus: LoanRequest['status']) => {
    const updated = loanRequests.map(item => {
      if (item.id === requestId) {
        const u = { ...item, status: newStatus, notesAdmin: adminNotesText || item.notesAdmin };
        
        // Notify applicant via mock system email instantly!
        const emailBody = `Bonjour ${item.personalInfo.prenom} ${item.personalInfo.nom.toUpperCase()},

Le statut de votre dossier de prêt référencé ${item.reference} a été modifié par nos analystes de crédit.

Nouveau statut de votre dossier : [ ${newStatus.toUpperCase()} ]
Montant : ${item.loanInfo.montantDemande.toLocaleString()} ${item.loanInfo.devise}
Décision motivée : ${adminNotesText || 'Dossier évalué conformément aux réglementations de l\'établissement.'}

Nous restons à votre entière disposition pour tout renseignement complémentaire relatif à cette notification de décision.

Cordialement,
Le service d'instruction CrediVite.`;

        mockSendEmailNotification(
          item.personalInfo.email,
          `Mise à jour de votre demande de prêt - ${item.reference}`,
          emailBody,
          'statut_change'
        );

        return u;
      }
      return item;
    });

    setLoanRequests(updated);
    saveLoanRequests(updated);
    setNotifications(getEmailNotifications()); // refresh sent mail logs
    
    // update current selected loan details
    const found = updated.find(x => x.id === requestId);
    if (found) {
      setSelectedLoan(found);
    }
  };

  const handleSaveAdminNotes = (requestId: string) => {
    const updated = loanRequests.map(item => {
      if (item.id === requestId) {
        return { ...item, notesAdmin: adminNotesText };
      }
      return item;
    });
    setLoanRequests(updated);
    saveLoanRequests(updated);
    
    // update state visual indicator
    const found = updated.find(x => x.id === requestId);
    if (found) {
      setSelectedLoan(found);
    }
    alert('Notes administratives de l\'instruction mises à jour avec succès.');
  };

  // Toggle Message read state
  const handleToggleMessageRead = (msgId: string) => {
    const updated = contactMessages.map(item => {
      if (item.id === msgId) {
        return { ...item, lu: !item.lu };
      }
      return item;
    });
    setContactMessages(updated);
    saveContactMessages(updated);
  };

  const handleDeleteMessage = (msgId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce message ?')) {
      const filtered = contactMessages.filter(item => item.id !== msgId);
      setContactMessages(filtered);
      saveContactMessages(filtered);
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(null);
      }
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cette demande de prêt ? Cette action est irréversible.')) {
      const filtered = loanRequests.filter(item => item.id !== loanId);
      setLoanRequests(filtered);
      saveLoanRequests(filtered);
      setSelectedLoan(null);
    }
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

  // Format date readable
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Visual status badge mapper
  const getStatusBadge = (status: LoanRequest['status']) => {
    switch (status) {
      case 'En attente':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3 animate-pulse" /> En attente
        </span>;
      case 'En cours':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
          <RefreshCw className="h-3 w-3 animate-spin duration-3000" /> En cours
        </span>;
      case 'Accepté':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle className="h-3 w-3" /> Accepté
        </span>;
      case 'Refusé':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle className="h-3 w-3" /> Refusé
        </span>;
      default:
        return <span className="px-2.5 py-1 text-xs rounded-full border">Sans statut</span>;
    }
  };

  // Compute key counters for visual telemetry header card
  const totalReceivedAmount = loanRequests.reduce((sum, item) => sum + item.loanInfo.montantDemande, 0);
  const pendingCount = loanRequests.filter(x => x.status === 'En attente').length;
  const inProgressCount = loanRequests.filter(x => x.status === 'En cours').length;
  const unreadMessagesCount = contactMessages.filter(x => !x.lu).length;

  // Filter loan requests list matching views and query
  const filteredLoans = loanRequests.filter(loan => {
    const matchesFilter = loanFilter === 'Tous' || loan.status === loanFilter;
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = `${loan.personalInfo.prenom} ${loan.personalInfo.nom}`.toLowerCase().includes(searchLower);
    const refMatch = loan.reference.toLowerCase().includes(searchLower);
    const professionMatch = loan.professionalInfo.profession.toLowerCase().includes(searchLower);
    const cityMatch = loan.personalInfo.ville.toLowerCase().includes(searchLower);
    return matchesFilter && (nameMatch || refMatch || professionMatch || cityMatch);
  });

  // Extract all files from every active loan request for the unified documents manager tab
  const getUnifiedDocumentsList = () => {
    const list: Array<{
      id: string;
      ownerName: string;
      reference: string;
      category: string;
      file: DocumentFile;
      uploadedAt: string;
    }> = [];

    loanRequests.forEach(loan => {
      const owner = `${loan.personalInfo.prenom} ${loan.personalInfo.nom.toUpperCase()}`;
      if (loan.documents.pieceIdentite) {
        list.push({ id: `${loan.id}-id`, ownerName: owner, reference: loan.reference, category: "Pièce d'identité (Recto)", file: loan.documents.pieceIdentite, uploadedAt: loan.createdAt });
      }
      if (loan.documents.pieceIdentiteVerso) {
        list.push({ id: `${loan.id}-id-verso`, ownerName: owner, reference: loan.reference, category: "Pièce d'identité (Verso)", file: loan.documents.pieceIdentiteVerso, uploadedAt: loan.createdAt });
      }
      if (loan.documents.justificatifDomicile) {
        list.push({ id: `${loan.id}-res`, ownerName: owner, reference: loan.reference, category: "Justificatif de domicile", file: loan.documents.justificatifDomicile, uploadedAt: loan.createdAt });
      }
      if (loan.documents.bulletinsSalaire) {
        list.push({ id: `${loan.id}-pay`, ownerName: owner, reference: loan.reference, category: "Bulletins de salaire", file: loan.documents.bulletinsSalaire, uploadedAt: loan.createdAt });
      }
      if (loan.documents.releveBancaire) {
        list.push({ id: `${loan.id}-bank`, ownerName: owner, reference: loan.reference, category: "Relevé bancaire", file: loan.documents.releveBancaire, uploadedAt: loan.createdAt });
      }
      if (loan.documents.autresDocs) {
        list.push({ id: `${loan.id}-extra`, ownerName: owner, reference: loan.reference, category: "Autre justificatif", file: loan.documents.autresDocs, uploadedAt: loan.createdAt });
      }
    });

    // filter unified list matching search
    const query = searchQuery.toLowerCase();
    if (!query) return list;
    return list.filter(item => 
      item.ownerName.toLowerCase().includes(query) || 
      item.reference.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) || 
      item.file.name.toLowerCase().includes(query)
    );
  };

  // Render Admin secure prompt if not logged in
  if (!isAdminLoggedIn) {
    return (
      <div id="admin-login-view" className="mx-auto max-w-md px-4 py-24">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <div className="text-center space-y-3 mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border text-white mb-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">Espace Conseil Administrateur</h1>
            <p className="text-xs text-slate-500">Connexion sécurisée aux outils de courtage et de validation bancaire.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900/90 mb-6 space-y-1">
            <span className="font-bold block text-amber-800">🔑 Identifiants d'accès d'évaluation :</span>
            <p>Saisissez le mot de passe de démonstration ci-dessous :</p>
            <p className="font-mono text-emerald-700 font-bold bg-white px-2 py-1 rounded inline-block mt-1">admin123</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex justify-between">
                <span>Mot de passe requis</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 pl-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Débloquer la console
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-view" className="bg-slate-50 py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner with state switcher */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">CrediVite Hub Instruction</span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 mt-1">Espace Analyste Financier</h1>
            <p className="text-xs text-slate-500 mt-1">Gérez et validez les dossiers d'octroi de prêt en temps réel.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLoanRequests(getLoanRequests());
                setContactMessages(getContactMessages());
                setNotifications(getEmailNotifications());
              }}
              className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              Rafraîchir les données
            </button>
            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="px-3.5 py-2 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1 hover:bg-rose-100 transition-colors"
            >
              Fermer la session
            </button>
          </div>
        </header>

        {/* Telemetry Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Demandes Actives</span>
            <span className="text-2xl font-black text-slate-950 font-mono block leading-none">{loanRequests.length}</span>
            <div className="flex gap-2 text-[10px] text-slate-400 font-bold">
              <span className="text-amber-500">{pendingCount} en attente</span>
              <span>·</span>
              <span className="text-blue-500">{inProgressCount} en cours</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Volume total analysé</span>
            <span className="text-2xl font-black text-slate-950 font-mono block leading-none">{totalReceivedAmount.toLocaleString()} €</span>
            <span className="text-[10px] text-slate-400 font-medium block">Intérêts négociés correspondants</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Nouveaux Messages</span>
            <span className="text-2xl font-black text-slate-950 font-mono block leading-none">{contactMessages.length}</span>
            <span className={`text-[10px] font-bold block ${unreadMessagesCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {unreadMessagesCount > 0 ? `● ${unreadMessagesCount} non lus` : 'Tous traités'}
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl text-white space-y-2 select-none relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/5 rounded-bl-full pointer-events-none" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">SMTP Notification</span>
            <span className="text-xl font-bold block">E-mails envoyés</span>
            <span className="text-xs text-slate-400 block">{notifications.length} notifications émises</span>
          </div>
        </div>

        {/* Tab Selection Filter Controls */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
          {[
            { id: 'loans', label: `Dossiers de crédit (${loanRequests.length})` },
            { id: 'messages', label: `Messages reçus (${contactMessages.length})` },
            { id: 'documents', label: `Vérification justificatifs (${getUnifiedDocumentsList().length})` },
            { id: 'emails', label: `Logs E-mails (${notifications.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors transition-all focus:outline-none ${
                activeTab === tab.id
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Query searches input & filter presets only on related screens */}
        {activeTab !== 'emails' && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white border border-slate-200/80 p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'loans' 
                    ? "Rechercher par nom, référence client, profession..."
                    : activeTab === 'documents'
                      ? "Rechercher par nom de fichier, référence, dossier..."
                      : "Rechercher par émetteur..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-950"
              />
            </div>
            
            {activeTab === 'loans' && (
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-100 p-1 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase px-1.5">Statut:</span>
                {(['Tous', 'En attente', 'En cours', 'Accepté', 'Refusé'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLoanFilter(f)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      loanFilter === f
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: LOANS DATATABLE VIEW */}
        {activeTab === 'loans' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {filteredLoans.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-1">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">Aucun dossier d'octroi de prêt trouvé.</p>
                <p className="text-xs text-slate-400">Modifiez vos critères de recherche ou enregistrez un nouveau dossier.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Référence</th>
                      <th className="px-6 py-3.5">Candidat</th>
                      <th className="px-6 py-3.5">Projet / Financement</th>
                      <th className="px-6 py-3.5">Revenus mensuels nets</th>
                      <th className="px-6 py-3.5">Date Soumission</th>
                      <th className="px-6 py-3.5">Statut</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredLoans.map((loan) => (
                      <tr 
                        key={loan.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          selectedLoan?.id === loan.id ? 'bg-slate-50/80' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-bold font-mono text-xs text-slate-900">
                          {loan.reference}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="block font-bold text-slate-900">{loan.personalInfo.prenom} {loan.personalInfo.nom.toUpperCase()}</span>
                            <span className="block text-xs text-slate-500 font-medium">{loan.professionalInfo.profession}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="block font-semibold text-slate-900">
                              {loan.loanInfo.montantDemande.toLocaleString()} {getDeviseSymbol(loan.loanInfo.devise)}
                            </span>
                            <span className="block text-xs text-slate-500">{loan.loanInfo.objetPret} · {loan.loanInfo.dureeSouhaitee} mois</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {loan.financialInfo.revenusMensuelsNets.toLocaleString()} €
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                          {formatDate(loan.createdAt).split(' à')[0]}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(loan.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              id={`btn-view-loan-${loan.id}`}
                              onClick={() => {
                                setSelectedLoan(loan);
                                setAdminNotesText(loan.notesAdmin || '');
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold rounded bg-slate-100 hover:bg-slate-250 text-slate-700 flex items-center gap-1 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Instruire
                            </button>
                            <button
                              onClick={() => handleDeleteLoan(loan.id)}
                              className="h-8 w-8 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: CONTACT MESSAGES VIEW */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Messages list */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[600px] overflow-y-auto">
              <header className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Boîte de réception</h3>
              </header>

              {contactMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-xs">Aucun message de contact dans la base.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {contactMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex flex-col gap-1 ${
                        selectedMessage?.id === msg.id ? 'bg-slate-50 border-r-4 border-slate-900' : ''
                      } ${!msg.lu ? 'bg-amber-50/20' : ''}`}
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-extrabold text-slate-900">{msg.nomComplet}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(msg.createdAt).split(' à')[0]}</span>
                      </div>
                      <span className={`text-xs font-bold leading-tight ${!msg.lu ? 'text-slate-950 font-black' : 'text-slate-700'}`}>
                        {msg.sujet}
                      </span>
                      <p className="text-xs text-slate-500 truncate w-full mt-1">
                        {msg.message}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                        <span className={msg.lu ? 'text-emerald-600' : 'text-amber-500'}>
                          {msg.lu ? '● Lu' : '● Nouveau message'}
                        </span>
                        <span>{msg.telephone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message details read pane */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
              {selectedMessage ? (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    <header className="border-b border-slate-100 pb-4 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 font-mono block">MESSAGE DE CONTACT</span>
                        <h2 className="text-lg font-extrabold text-slate-950 mt-1">{selectedMessage.sujet}</h2>
                        <span className="text-xs text-slate-500 leading-none block mt-1">Reçu le {formatDate(selectedMessage.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleMessageRead(selectedMessage.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          {selectedMessage.lu ? 'Marquer non lu' : 'Marquer comme lu'}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                          className="px-2 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </header>

                    {/* Sender profile */}
                    <div className="bg-slate-50 rounded-xl p-4 mt-6 grid grid-cols-2 gap-3.5 text-xs font-medium">
                      <div>
                        <span className="text-slate-400 block">Émetteur</span>
                        <span className="text-slate-900 font-bold">{selectedMessage.nomComplet}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">E-mail</span>
                        <a href={`mailto:${selectedMessage.email}`} className="text-emerald-600 font-bold hover:underline transition-all block truncate">{selectedMessage.email}</a>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Numéro de téléphone</span>
                        <span className="text-slate-900 font-bold">{selectedMessage.telephone}</span>
                      </div>
                    </div>

                    {/* Content body body */}
                    <div className="mt-6">
                      <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Corps du message</span>
                      <div className="rounded-xl border border-slate-100 p-4 text-xs text-slate-700 leading-relaxed bg-white shadow-inner font-sans whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-400 text-center">
                    Utilisez le bouton e-mail pour écrire une réponse directe à ce client.
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-center py-12">
                  <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">Sélectionnez un message à lire</p>
                  <p className="text-xs">Les messages reçus permettent de répondre aux demandes d'informations rapides.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SECTION 3: DOCUMENTS VERIFICATION LIST */}
        {activeTab === 'documents' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {getUnifiedDocumentsList().length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">Aucun justificatif importé disponible.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Fichier justificatif</th>
                      <th className="px-6 py-3.5">Catégorie</th>
                      <th className="px-6 py-3.5">Propriétaire</th>
                      <th className="px-6 py-3.5">Dossier Associé</th>
                      <th className="px-6 py-3.5 font-mono">Taille</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {getUnifiedDocumentsList().map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{item.file.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 border text-slate-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {item.ownerName}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-teal-600">
                          {item.reference}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-medium">
                          {(item.file.size / 1024 / 1024).toFixed(2)} Mo
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setPreviewDocument({ file: item.file, ownerName: item.ownerName, category: item.category })}
                            className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center justify-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Visualiser
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: SMTP NOTIFICATION LOGS VIEW */}
        {activeTab === 'emails' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <header className="p-4 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logs de transmission d'E-mails</span>
            </header>
            
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-xs">Aucun e-mail émis par le système.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {notifications.map((not) => (
                  <div key={not.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3.5">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono bg-slate-900 text-white">
                          SMTP OK
                        </span>
                        <span className="text-xs font-medium text-slate-400 font-mono">
                          {formatDate(not.sentAt)}
                        </span>
                      </div>
                      <div className="text-slate-500 font-medium">
                        Destinataire : <strong className="text-slate-800 font-mono font-bold font-semibold">{not.to}</strong>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {not.subject}
                      </h4>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 font-mono text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {not.body}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBMODAL 1: LOAN DETAILS DIALOG */}
        <AnimatePresence>
          {selectedLoan && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col justify-between"
              >
                
                {/* Header detail */}
                <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-emerald-400">INSTRUCTION DOSSIER</span>
                    <h3 className="text-lg font-black font-mono leading-none">{selectedLoan.reference}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedLoan.status)}
                    <button
                      onClick={() => setSelectedLoan(null)}
                      className="text-slate-400 hover:text-white p-1 text-sm font-bold"
                    >
                      ✕ Fermer
                    </button>
                  </div>
                </header>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  
                  {/* Grid personal & financial info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                    
                    {/* Personal block */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 space-y-3.5">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px]">1. Identité de l'emprunteur</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-400">Nom complet :</span>
                        <strong className="text-slate-800 text-right">{selectedInter(selectedLoan.personalInfo.sex)} {selectedLoan.personalInfo.prenom} {selectedLoan.personalInfo.nom.toUpperCase()}</strong>
                        
                        <span className="text-slate-400">Né le :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.personalInfo.dateNaissance}</span>
                        
                        <span className="text-slate-400">Nationalité :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.personalInfo.nationalite}</span>

                        <span className="text-slate-400">Situation Matrimoniale :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.personalInfo.situationMatrimoniale}</span>

                        <span className="text-slate-400">Téléphone portable :</span>
                        <a href={`tel:${selectedLoan.personalInfo.telephone}`} className="text-emerald-700 text-right hover:underline font-bold">{selectedLoan.personalInfo.telephone}</a>

                        <span className="text-slate-400">Adresse de contact :</span>
                        <a href={`mailto:${selectedLoan.personalInfo.email}`} className="text-emerald-700 text-right hover:underline font-bold truncate block">{selectedLoan.personalInfo.email}</a>

                        <span className="text-slate-400">Adresse de résidence :</span>
                        <span className="text-slate-800 text-right truncate block" title={selectedLoan.personalInfo.adresse}>{selectedLoan.personalInfo.adresse}, {selectedLoan.personalInfo.ville} ({selectedLoan.personalInfo.pays})</span>
                      </div>
                    </div>

                    {/* Act & Fin detail */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 space-y-3.5">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px]">2. Situation Professionnelle & Revenus</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-400">Profession exercée :</span>
                        <strong className="text-slate-800 text-right">{selectedLoan.professionalInfo.profession}</strong>
                        
                        <span className="text-slate-400">Employeur déclaré :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.professionalInfo.employeur}</span>

                        <span className="text-slate-400">Type de contrat :</span>
                        <span className="text-slate-800 text-right font-bold">{selectedLoan.professionalInfo.typeContrat}</span>

                        <span className="text-slate-400">Ancienneté d'activité :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.professionalInfo.anciennete}</span>

                        <span className="text-slate-400">Revenus mensuels :</span>
                        <span className="text-slate-800 text-right font-mono font-bold text-slate-900">{selectedLoan.professionalInfo.revenusMensuels.toLocaleString()} {getDeviseSymbol(selectedLoan.loanInfo.devise)}</span>

                        <span className="text-slate-400">Perception du salaire :</span>
                        <span className="text-slate-800 text-right">{selectedLoan.professionalInfo.datePerceptionSalaire}</span>
                      </div>
                    </div>

                  </div>

                  {/* Financial coordinates bank */}
                  <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b pb-1">3. Banque de versement & Charges bancaires</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Établissement financier</span>
                        <strong className="text-slate-800 block text-xs">{selectedLoan.financialInfo.banquePrincipale}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">IBAN / Numéro de compte client</span>
                        <strong className="text-slate-800 block text-xs font-mono select-all overflow-x-auto whitespace-nowrap">{selectedLoan.financialInfo.iban}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Titulaire déclaré</span>
                        <span className="text-slate-800 block text-xs truncate">{selectedLoan.financialInfo.nomTitulaireCompte}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200 leading-tight">
                      <div>
                        <span className="text-slate-400 block">Revenus Nets Mensuels</span>
                        <strong className="text-slate-800 text-sm font-mono font-bold font-semibold">{selectedLoan.financialInfo.revenusMensuelsNets.toLocaleString()} €</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Charges fixes de foyer</span>
                        <strong className="text-slate-800 text-sm font-mono font-bold">{selectedLoan.financialInfo.chargesMensuelles.toLocaleString()} €</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Taux d'endettement théorique</span>
                        <strong className={`text-sm font-mono font-bold font-semibold block ${
                          ((selectedLoan.financialInfo.chargesMensuelles / selectedLoan.financialInfo.revenusMensuelsNets) * 100) > 33 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {Math.round((selectedLoan.financialInfo.chargesMensuelles / selectedLoan.financialInfo.revenusMensuelsNets) * 100)} %
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Prêts externes déclarés</span>
                        <span className="text-slate-700 italic block text-[10px] truncate" title={selectedLoan.financialInfo.pretsEnCours}>{selectedLoan.financialInfo.pretsEnCours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supporting files direct access list */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">4. Pièces justificatives fournies</h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "1. Pièce d'identité (Recto)", file: selectedLoan.documents.pieceIdentite },
                        { label: "2. Pièce d'identité (Verso)", file: selectedLoan.documents.pieceIdentiteVerso },
                        { label: "3. Bulletin de salaire", file: selectedLoan.documents.bulletinsSalaire },
                        { label: "4. Relevé bancaire", file: selectedLoan.documents.releveBancaire }
                      ].map((docMeta, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block truncate">{docMeta.label}</span>
                            <span className="text-[11px] font-semibold text-slate-800 truncate block leading-tight mt-0.5 select-all">
                              {docMeta.file ? docMeta.file.name : 'Non fourni'}
                            </span>
                          </div>
                          {docMeta.file ? (
                            <button
                              onClick={() => setPreviewDocument({ file: docMeta.file!, ownerName: `${selectedLoan.personalInfo.prenom} ${selectedLoan.personalInfo.nom.toUpperCase()}`, category: docMeta.label })}
                              className="w-full inline-flex items-center justify-center gap-1 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              Visualiser
                            </button>
                          ) : (
                            <span className="w-full block text-center py-1 text-[10px] font-bold bg-slate-50 text-slate-300 rounded pointer-events-none">
                              Absent
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin notes input write area */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest">5. Décisions motivées & notes d'instruction administratives</label>
                    <textarea
                      rows={3}
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      placeholder="Indiquez ici les détails de l'analyse (ex: 'Copie conforme', 'Pièce d'identité illisible', 'Avis favorable après appel de contrôle'...)"
                      className="w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => handleSaveAdminNotes(selectedLoan.id)}
                        className="px-3.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Enregistrer uniquement les notes
                      </button>
                    </div>
                  </div>

                </div>

                {/* Modifiers footer action gate */}
                <footer className="bg-slate-50 px-6 py-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <span className="text-[10px] font-medium text-slate-400">Modifier le statut d'instruction :</span>
                  
                  <div className="flex flex-wrap gap-1.5 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={() => handleUpdateStatus(selectedLoan.id, 'En attente')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedLoan.status === 'En attente'
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLoan.id, 'En cours')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedLoan.status === 'En cours'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLoan.id, 'Accepté')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedLoan.status === 'Accepté'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Accepter l'offre
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLoan.id, 'Refusé')}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedLoan.status === 'Refusé'
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Refuser l'offre
                    </button>
                  </div>
                </footer>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUBMODAL 2: DOCUMENT VIEWER POPUP */}
        <AnimatePresence>
          {previewDocument && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl overflow-hidden w-full max-w-2xl border flex flex-col justify-between"
              >
                
                <header className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center shrink-0 text-xs">
                  <div>
                    <span className="block text-[10px] text-emerald-400 font-bold uppercase">{previewDocument.category}</span>
                    <strong className="block text-slate-100 truncate mt-0.5">{previewDocument.file.name}</strong>
                  </div>
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="text-slate-400 hover:text-white p-1 font-bold text-sm"
                  >
                    Fermer
                  </button>
                </header>

                <div className="p-6 bg-slate-100/50 flex-1 flex flex-col items-center justify-center overflow-auto min-h-[300px] max-h-[70vh]">
                  
                  {previewDocument.file.dataUrl && (
                    previewDocument.file.type.startsWith('image/') ? (
                      <img
                        src={previewDocument.file.dataUrl}
                        alt="Aperçu du justificatif"
                        referrerPolicy="no-referrer"
                        className="max-h-[60vh] object-contain rounded-xl shadow border-2 border-white"
                      />
                    ) : (
                      <div className="bg-white rounded-xl shadow p-6 max-w-md border border-slate-200 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">Document PDF / ZIP crypté</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Pour des raisons de conformité bancaire et RGPD, l'aperçu dynamique direct des flux de contenu des fichiers PDF non-image est déchargé du cache de session. Vous pouvez instuire la validité de la pièce ci-dessous.
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-50 border p-2 rounded-lg text-left space-y-1">
                          <div>Propriétaire : <strong>{previewDocument.ownerName}</strong></div>
                          <div>Type mine : <strong>{previewDocument.file.type}</strong></div>
                          <div>Format : <strong>{(previewDocument.file.size / 1024 / 1024).toFixed(2)} Mo</strong></div>
                        </div>
                      </div>
                    )
                  )}

                  {!previewDocument.file.dataUrl && (
                    <div className="bg-white rounded-xl shadow p-6 max-w-sm border border-slate-200 text-center space-y-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-950">Fichier de simulation</h4>
                      <p className="text-xs text-slate-500">
                        Fichier de démonstration pré-chargé dans le système. Toutes ses dimensions d'octroi de prêt sont conformes.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono bg-slate-50 p-2 rounded border">
                        Nom : {previewDocument.file.name}
                      </div>
                    </div>
                  )}

                </div>

                <footer className="p-4 bg-slate-50 border-t flex justify-end gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      alert('Téléchargement du document simulé avec succès (dossier conforme).');
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger la pièce
                  </button>
                </footer>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Visual layout helper for salutations
function selectedInter(sexe: string): string {
  if (sexe === 'M') return 'M.';
  if (sexe === 'F') return 'Mme';
  return 'M./Mme';
}
