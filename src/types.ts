export interface DocumentFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 data url for preview
}

export interface LoanRequest {
  id: string;
  reference: string;
  status: 'En attente' | 'En cours' | 'Accepté' | 'Refusé';
  createdAt: string;
  notesAdmin?: string;

  // Personal Info
  personalInfo: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: 'M' | 'F' | 'Autre';
    nationalite: string;
    situationMatrimoniale: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve';
    adresse: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
  };

  // Professional Info
  professionalInfo: {
    profession: string;
    employeur: string;
    anciennete: string; // duration, e.g. "3 ans" or "6 mois"
    typeContrat: 'CDI' | 'CDD' | 'Freelance' | 'Fonctionnaire' | 'Autres';
    revenusMensuels: number;
    revenusComplementaires: number;
    datePerceptionSalaire: string; // day of the month, e.g., "05"
  };

  // Loan Info
  loanInfo: {
    montantDemande: number;
    devise: string;
    dureeSouhaitee: number; // in months
    objetPret: string; // "Immobilier" | "Consommation" | "Automobile" | "Travaux" | "Rachat de crédit" | "Autre"
    dateDeblocage: string;
  };

  // Financial Info
  financialInfo: {
    banquePrincipale: string;
    nomTitulaireCompte: string;
    typeCompte: string; // e.g. "Courant", "Épargne"
    iban: string;
    swiftBic?: string;
    revenusMensuelsNets: number;
    chargesMensuelles: number;
    pretsEnCours: string; // descriptive list or details
  };

  // Documents Justificatifs
  documents: {
    pieceIdentite: DocumentFile | null;
    pieceIdentiteVerso?: DocumentFile | null;
    justificatifDomicile: DocumentFile | null;
    bulletinsSalaire: DocumentFile | null;
    releveBancaire: DocumentFile | null;
    autresDocs?: DocumentFile | null;
  };
}

export interface ContactMessage {
  id: string;
  nomComplet: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
  createdAt: string;
  lu: boolean;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'demande_recue' | 'message_recu' | 'statut_change';
}
