// Statuts possibles pour une demande (enum et labels)
export const DemandeStatut = {
  EMIS: "emis",
  CONFIRME: "confirme",
  APPROUVE: "approuve",
  VALIDE: "valide",
  LIVRE: "livre",
  REFUSE: "refuse",
} as const;

export type DemandeStatut = (typeof DemandeStatut)[keyof typeof DemandeStatut];

// Pour la compatibilité avec l'interface existante
export const RequestStatus = {
  TOUS: "tous",
  ...DemandeStatut,
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

// Labels en français pour les statuts
export const RequestStatusLabels: Record<RequestStatus, string> = {
  tous: "Tous",
  emis: "Émis",
  confirme: "Confirmé",
  approuve: "Approuvé",
  valide: "Validé",
  livre: "Livré",
  refuse: "Refusé",
};

// Couleurs pour les statuts
export const RequestStatusColors: Record<RequestStatus, string> = {
  tous: "text-gray-600",
  emis: "text-blue-600",
  confirme: "text-yellow-600",
  approuve: "text-green-600",
  valide: "text-purple-600",
  livre: "text-orange-600",
  refuse: "text-red-600",
};

// Interface d'une demande de matériel (version complète)
export interface MaterialRequest {
  id: string;
  demande: string; // Nom du matériel demandé
  nomMagasinier: string; // Nom du magasinier
  quantiteDemandee: number; // Quantité demandée
  unite?: string; // Unité du stock item
  profil: string; // Profil du demandeur
  status: RequestStatus;
  dateDemande: string;
  userId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Champs additionnels pour le détail
  nomMagasin?: string;
  nomProjet?: string;
  adresseMagasin?: string;
  donneurOrdre?: string;
  quantiteValidee?: number;
  motif?: string;
  observation?: string;
  traitements?: RequestTreatment[];
  
  // Commentaires à chaque étape
  commentaireConfirmation?: string;
  commentaireApprobation?: string;
  commentaireValidation?: string;
  
  // Quantités ajustées à chaque étape
  quantiteApprouvee?: number;
  
  // Autres champs
  coutTotalApprox?: number;
  isValide?: boolean;
}

// Traitement d'une demande
export interface RequestTreatment {
  id: string;
  nom: string;
  profil: string;
  action: RequestStatus; // approuve, valide, refuse, etc.
  date: string;
  commentaire?: string; // Commentaire ajouté lors du traitement
  quantite?: number; // Quantité ajustée lors du traitement
}
