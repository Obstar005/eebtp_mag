/**
 * Données mockées pour les demandes
 * À utiliser en cas d'erreur API ou pour les tests
 */

import type { ApiDemande } from "../types/api-demandes";

export const mockApiDemandes: ApiDemande[] = [
  {
    id: 1,
    magasin: 1,
    stock_item: 1,
    quantite: 100,
    statut: "Emise",
    raison: "Besoin urgent pour le projet Alpha",
    date_creation: "2025-01-15T08:00:00Z",
    magasin_name: "Magasin Central",
    stock_item_name: "Ciment Portland",
    emis_par_name: "Jean Dupont",
    number: "DEM-001",
  },
  {
    id: 2,
    magasin: 2,
    stock_item: 2,
    quantite: 50,
    statut: "Confirmée",
    raison: "Stock épuisé",
    date_creation: "2025-01-14T14:30:00Z",
    magasin_name: "Magasin Nord",
    stock_item_name: "Sable fin",
    emis_par_name: "Marie Martin",
    number: "DEM-002",
  },
  {
    id: 3,
    magasin: 1,
    stock_item: 3,
    quantite: 75,
    statut: "Approuvée",
    raison: "Extension du projet",
    date_creation: "2025-01-13T10:15:00Z",
    magasin_name: "Magasin Central",
    stock_item_name: "Gravier 15mm",
    emis_par_name: "Pierre Durand",
    number: "DEM-003",
  },
  {
    id: 4,
    magasin: 3,
    stock_item: 4,
    quantite: 200,
    statut: "Validée",
    raison: "Nouveau chantier",
    date_creation: "2025-01-12T09:00:00Z",
    magasin_name: "Magasin Sud",
    stock_item_name: "Béton prêt à l'emploi",
    emis_par_name: "Sophie Bernard",
    number: "DEM-004",
  },
  {
    id: 5,
    magasin: 2,
    stock_item: 5,
    quantite: 30,
    statut: "Rejetée",
    raison: "Complément de stock",
    date_creation: "2025-01-11T13:20:00Z",
    magasin_name: "Magasin Nord",
    stock_item_name: "Carrelage 30x30",
    emis_par_name: "Luc Moreau",
    number: "DEM-005",
  },
  {
    id: 6,
    magasin: 1,
    stock_item: 6,
    quantite: 150,
    statut: "Livrée",
    raison: "Réparations urgentes",
    date_creation: "2025-01-10T07:45:00Z",
    magasin_name: "Magasin Central",
    stock_item_name: "Tuyaux PVC 100mm",
    emis_par_name: "Anne Petit",
    number: "DEM-006",
  },
];

export const mockDemandeStats = {
  total_demandes: mockApiDemandes.length,
  demandes_emises: mockApiDemandes.filter((d) => d.statut === "Emise").length,
  demandes_confirmees: mockApiDemandes.filter((d) => d.statut === "Confirmée")
    .length,
  demandes_approuvees: mockApiDemandes.filter((d) => d.statut === "Approuvée")
    .length,
  demandes_validees: mockApiDemandes.filter((d) => d.statut === "Validée")
    .length,
  demandes_rejetees: mockApiDemandes.filter((d) => d.statut === "Rejetée")
    .length,
  demandes_livrees: mockApiDemandes.filter((d) => d.statut === "Livrée").length,
};
