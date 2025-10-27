/**
 * Données mockées pour les demandes
 * À utiliser uniquement en cas d'erreur API critique
 */

import type { ApiDemande } from "../types/api-demandes";

export const mockApiDemandes: ApiDemande[] = [];

export const mockDemandeStats = {
  total_demandes: 0,
  demandes_emises: 0,
  demandes_confirmees: 0,
  demandes_approuvees: 0,
  demandes_validees: 0,
  demandes_rejetees: 0,
  demandes_livrees: 0,
};
