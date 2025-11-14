// Types pour l'historique des actions
export interface HistoriqueAction {
  id: number;
  user: string;
  action_type:
    | "creation"
    | "modification"
    | "suppression"
    | "validation"
    | "connexion"
    | "autre";
  description: string;
  date_action: string; // ISO datetime
  objet_concerne?: string;
}

export type PeriodeHistorique = "jour" | "semaine" | "mois" | "total";
