// Types pour la gestion des déclarations
export interface Declaration {
  id: number;
  type_enum: DeclarationType;
  stock_item_id: number;
  quantite_float: number;
  date_creation: Date;
  date_modif: Date;
  date_approbation?: Date;
  date_voeux_livrer_string?: string;
  user_id: number;
  magasin_id: number;

  // Relations
  stockItem?: {
    id: number;
    name: string;
    description?: string;
    unite?: string;
  };
  user?: {
    id: number;
    name: string;
    surname: string;
  };
  magasin?: {
    id: number;
    name: string;
  };
  fournisseur?: {
    id: number;
    name: string;
    telephone?: string;
  };
  receveur?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  deposant?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  livreur?: {
    name: string;
    telephone?: string;
  };
  motif?: string;

  // Champs supplémentaires de l'API
  signature_livreur?: string; // URL vers la signature du livreur
  demande_source_id?: number; // Référence vers une demande source
  source_id?: number; // Source de l'entrée
}

export const DeclarationType = {
  ENTREE: "entree",
  SORTIE: "sortie",
  RETOUR: "retour",
} as const;

export type DeclarationType =
  (typeof DeclarationType)[keyof typeof DeclarationType];

export interface CreateDeclarationData {
  type_enum: DeclarationType;
  stock_item_id: number;
  quantite_float: number;
  date_voeux_livrer_string?: string;
  magasin_id: number;
  fournisseur?: {
    name: string;
    telephone?: string;
  };
  receveur?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  deposant?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  motif?: string;
}

export interface UpdateDeclarationData {
  id: number;
  type_enum?: DeclarationType;
  stock_item_id?: number;
  quantite_float?: number;
  date_approbation?: Date;
  date_voeux_livrer_string?: string;
  fournisseur?: {
    name: string;
    telephone?: string;
  };
  receveur?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  deposant?: {
    name: string;
    fonction: string;
    telephone?: string;
  };
  motif?: string;
}

export interface DeclarationFilter {
  search?: string;
  type_enum?: DeclarationType;
  magasin_id?: number;
  dateStart?: string;
  dateEnd?: string;
  periode?: PeriodeType; // Nouveau paramètre pour les filtres de période
}

// Type pour les périodes supportées par l'API
export type PeriodeType = "jour" | "semaine" | "mois" | "total";

export interface DeclarationStats {
  totalEntrees: number;
  totalSorties: number;
  totalRetours: number;
  variationVsHier: {
    entrees: number;
    sorties: number;
    retours: number;
  };
}

// Interface correspondant à la réponse API de /Mouvements/stats
export interface ApiStatsResponse {
  livraisons: number;
  sorties: number;
  retours: number;
}
