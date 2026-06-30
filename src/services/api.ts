import { LoanRequest, ContactMessage, EmailNotification } from '../types';

// Mock initial data to make the app feel alive and fully realized upon first visit
const DEFAULT_LOAN_REQUESTS: LoanRequest[] = [
  {
    id: 'loan-1',
    reference: 'CRE-2026-0034',
    status: 'En cours',
    createdAt: '2026-06-01T14:32:00Z',
    notesAdmin: 'Dossier solide en CDI. En attente de vérification du relevé bancaire de mai.',
    personalInfo: {
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: '1988-11-23',
      sexe: 'F',
      nationalite: 'Française',
      situationMatrimoniale: 'Marié(e)',
      adresse: '14 Avenue de la République',
      ville: 'Paris',
      pays: 'France',
      telephone: '+33 6 12 34 56 78',
      email: 'sophie.martin@example.com'
    },
    professionalInfo: {
      profession: 'Ingénieure Logiciel',
      employeur: 'Tech Solutions SAS',
      anciennete: '4 ans',
      typeContrat: 'CDI',
      revenusMensuels: 4200,
      revenusComplementaires: 150,
      datePerceptionSalaire: '05'
    },
    loanInfo: {
      montantDemande: 35000,
      devise: 'EUR',
      dureeSouhaitee: 60, // 5 ans
      objetPret: 'Travaux',
      dateDeblocage: '2026-07-01'
    },
    financialInfo: {
      banquePrincipale: 'BNP Paribas',
      nomTitulaireCompte: 'Mme Sophie Martin',
      typeCompte: 'Courant',
      iban: 'FR76 3000 4000 0012 3456 7890 123',
      swiftBic: 'BNPAFRPPXXX',
      revenusMensuelsNets: 4200,
      chargesMensuelles: 1200,
      pretsEnCours: 'Aucun'
    },
    documents: {
      pieceIdentite: { name: 'CNI_Sophie_Martin.pdf', size: 1450000, type: 'application/pdf' },
      justificatifDomicile: { name: 'Facture_EDF_Mai26.pdf', size: 980000, type: 'application/pdf' },
      bulletinsSalaire: { name: 'Fiches_Paie_3_Derniers_Mois.pdf', size: 4200000, type: 'application/pdf' },
      releveBancaire: { name: 'Releve_Bancaire_Mai2026.pdf', size: 560000, type: 'application/pdf' },
      autresDocs: null
    }
  },
  {
    id: 'loan-2',
    reference: 'CRE-2026-0035',
    status: 'En attente',
    createdAt: '2026-06-03T09:15:00Z',
    personalInfo: {
      nom: 'Dubois',
      prenom: 'Julien',
      dateNaissance: '1995-04-12',
      sexe: 'M',
      nationalite: 'Belge',
      situationMatrimoniale: 'Célibataire',
      adresse: '42 Rue des Bouchers',
      ville: 'Bruxelles',
      pays: 'Belgique',
      telephone: '+32 475 98 76 54',
      email: 'julien.dubois@example.com'
    },
    professionalInfo: {
      profession: 'Chef de Rayon',
      employeur: 'Supermarchés Carrefour',
      anciennete: '2 ans',
      typeContrat: 'CDI',
      revenusMensuels: 2100,
      revenusComplementaires: 0,
      datePerceptionSalaire: '28'
    },
    loanInfo: {
      montantDemande: 8500,
      devise: 'EUR',
      dureeSouhaitee: 24, // 2 ans
      objetPret: 'Automobile',
      dateDeblocage: '2026-06-25'
    },
    financialInfo: {
      banquePrincipale: 'KBC Banque',
      nomTitulaireCompte: 'M. Julien Dubois',
      typeCompte: 'Courant',
      iban: 'BE96 1234 5678 9012',
      swiftBic: 'KREDFFFFXXX',
      revenusMensuelsNets: 2100,
      chargesMensuelles: 650,
      pretsEnCours: 'Un prêt étudiant de 150€/mois restant pour 8 mois.'
    },
    documents: {
      pieceIdentite: { name: 'Passeport_Julien_D.jpg', size: 2300000, type: 'image/jpeg' },
      justificatifDomicile: { name: 'Attestation_Logement_Commune.pdf', size: 450000, type: 'application/pdf' },
      bulletinsSalaire: { name: 'Salaire_Fiches_Dubois.zip', size: 5120000, type: 'application/zip' },
      releveBancaire: { name: 'Releve_KBC_Mai2026.pdf', size: 1200000, type: 'application/pdf' },
      autresDocs: null
    }
  },
  {
    id: 'loan-3',
    reference: 'CRE-2026-0029',
    status: 'Accepté',
    createdAt: '2026-05-28T16:45:00Z',
    notesAdmin: 'Offre envoyée et signée électroniquement le 29 Mai. Financement débloqué avec succès.',
    personalInfo: {
      nom: 'Sarrault',
      prenom: 'Camille',
      dateNaissance: '1976-08-30',
      sexe: 'Autre',
      nationalite: 'Canadienne',
      situationMatrimoniale: 'Divorcé(e)',
      adresse: '840 Rue Saint-Denis',
      ville: 'Montréal',
      pays: 'Canada',
      telephone: '+1 (514) 555-0199',
      email: 'camille.sarrault@example.ca'
    },
    professionalInfo: {
      profession: 'Directeur Artistique',
      employeur: 'Studio Créatif Oasis',
      anciennete: '8 ans',
      typeContrat: 'Fonctionnaire', // ou assimilé
      revenusMensuels: 5500,
      revenusComplementaires: 800,
      datePerceptionSalaire: '01'
    },
    loanInfo: {
      montantDemande: 120000,
      devise: 'CAD',
      dureeSouhaitee: 180, // 15 ans
      objetPret: 'Immobilier',
      dateDeblocage: '2026-06-15'
    },
    financialInfo: {
      banquePrincipale: 'Banque Royale du Canada (RBC)',
      nomTitulaireCompte: 'Camille Sarrault',
      typeCompte: 'Épargne & Courant de concert',
      iban: 'CA33 RYOB 0002 9988 7766 5',
      swiftBic: 'ROYCCA22XXX',
      revenusMensuelsNets: 6300,
      chargesMensuelles: 1900,
      pretsEnCours: 'Aucun'
    },
    documents: {
      pieceIdentite: { name: 'Permis_Conduire_Camille_S.jpg', size: 1850000, type: 'image/jpeg' },
      justificatifDomicile: { name: 'Compte_Taxes_Sarrault_2026.pdf', size: 1540000, type: 'application/pdf' },
      bulletinsSalaire: { name: 'T4_Et_Declaration_Revenus.pdf', size: 6780000, type: 'application/pdf' },
      releveBancaire: { name: 'Releves_Comptes_RBC_3mois.pdf', size: 3400000, type: 'application/pdf' },
      autresDocs: null
    }
  }
];

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    nomComplet: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    telephone: '+33 6 88 99 00 11',
    sujet: 'Prêt Personnel Consommation - Demande de taux',
    message: 'Bonjour, j\'aimerais connaître le taux d\'intérêt annuel effectif global (TAEG) moyen que vous proposez pour un prêt consommation de 15 000 € sur une durée de 36 mois. Pouvez-vous également m\'indiquer s\'il y a des frais de dossier ? Merci d\'avance.',
    createdAt: '2026-06-03T11:20:00Z',
    lu: false
  },
  {
    id: 'msg-2',
    nomComplet: 'Elena Rostova',
    email: 'elena.rost@example.com',
    telephone: '+33 7 11 22 33 44',
    sujet: 'Partenariat courtier crédit',
    message: 'Bonjour, je suis courtier indépendant basé à Lyon et je souhaite échanger avec un responsable de votre agence au sujet d\'un éventuel partenariat d\'apport d\'affaires. J\'accompagne plusieurs dizaines de clients par an. Merci de me recontacter.',
    createdAt: '2026-05-30T15:10:00Z',
    lu: true
  }
];

const DEFAULT_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-1',
    to: 'sillyfr079@gmail.com', // Dynamic notification address based on User email in metadata!
    subject: 'Nouvelle demande de prêt reçue - Réf: CRE-2026-0035',
    body: 'Bonjour,\n\nUne nouvelle demande de prêt a été soumise sur votre site web :\n\n- Candidat : Julien Dubois\n- Montant : 8 500 EUR\n- Objet : Automobile\n- Statut : En attente\n\nVous pouvez consulter cette demande et ses documents justificatifs depuis votre tableau de bord administrateur.\n\nCordialement,\nVotre Agence de Prêt & Crédit.',
    sentAt: '2026-06-03T09:15:10Z',
    type: 'demande_recue'
  },
  {
    id: 'notif-2',
    to: 'sillyfr079@gmail.com',
    subject: 'Nouveau message de contact reçu - Pierre Durand',
    body: 'Bonjour,\n\nUn nouveau message a été envoyé depuis le formulaire de contact par Pierre Durand (pierre.durand@example.com).\n\nSujet : Prêt Personnel Consommation - Demande de taux\n\nConsultez et répondez à ce message depuis l\'espace Admin.\n\nCordialement.',
    sentAt: '2026-06-03T11:20:05Z',
    type: 'message_recu'
  }
];

// Helper to load or initialize from localStorage
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn("Storage quota exceeded, trying to free up space by stripping heavy document payloads...", e);
      if (Array.isArray(value)) {
        const cleanedValue = value.map((item: any) => {
          if (item && item.documents) {
            const documents = { ...item.documents };
            for (const docKey in documents) {
              if (documents[docKey] && documents[docKey].dataUrl) {
                documents[docKey] = {
                  ...documents[docKey],
                  dataUrl: undefined
                };
              }
            }
            return {
              ...item,
              documents
            };
          }
          return item;
        });
        try {
          localStorage.setItem(key, JSON.stringify(cleanedValue));
          console.info("Cleaned list successfully saved to local storage without heavy document payloads.");
          return;
        } catch (retryErr) {
          console.error("Failed to save even after stripping dataUrls of individual documents. Clearing older history items to release space...", retryErr);
        }
      }
      // If still failing or not an array, let's keep only the 5 most recent records
      if (Array.isArray(value)) {
        try {
          const shortened = value.slice(0, 5).map((item: any) => {
            if (item && item.documents) {
              const documents = { ...item.documents };
              for (const docKey in documents) {
                if (documents[docKey] && documents[docKey].dataUrl) {
                  documents[docKey] = { ...documents[docKey], dataUrl: undefined };
                }
              }
              return { ...item, documents };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(shortened));
          console.info("Saved shortened list (5 most recent entries, stripped of heavy doc payloads) to local storage successfully.");
          return;
        } catch (superRetryErr) {
          console.error("Failed all retry attempts to save data:", superRetryErr);
        }
      }
    }
    // Fail silently or log to console instead of throwing a fatal error that crashes the UI
    console.error("Could not write to local storage:", e);
  }
}

export const getLoanRequests = (): LoanRequest[] => {
  return getLocalStorageItem('loan_requests', DEFAULT_LOAN_REQUESTS);
};

export const saveLoanRequests = (requests: LoanRequest[]): void => {
  setLocalStorageItem('loan_requests', requests);
};

export const getContactMessages = (): ContactMessage[] => {
  return getLocalStorageItem('contact_messages', DEFAULT_MESSAGES);
};

export const saveContactMessages = (messages: ContactMessage[]): void => {
  setLocalStorageItem('contact_messages', messages);
};

export const getEmailNotifications = (): EmailNotification[] => {
  return getLocalStorageItem('email_notifications', DEFAULT_NOTIFICATIONS);
};

export const saveEmailNotifications = (notifications: EmailNotification[]): void => {
  setLocalStorageItem('email_notifications', notifications);
};

// Generate an agency-style reference number
export const generateReference = (): string => {
  const year = new Date().getFullYear();
  const index = getLoanRequests().length + 1;
  const zeroPadded = String(index).padStart(4, '0');
  return `CRE-${year}-${zeroPadded}`;
};

// Simulate SMTP/HTTP email delivery log
export const mockSendEmailNotification = (to: string, subject: string, body: string, type: EmailNotification['type']): void => {
  const notifs = getEmailNotifications();
  const newNotif: EmailNotification = {
    id: `notif-${Date.now()}`,
    to,
    subject,
    body,
    sentAt: new Date().toISOString(),
    type
  };
  notifs.unshift(newNotif); // latest first
  saveEmailNotifications(notifs);
};
