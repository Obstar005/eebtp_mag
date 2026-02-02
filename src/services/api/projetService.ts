import { projetApiService } from "./projetApiService";
import type { ApiProjetPhoto } from "../../types/api-projets";
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ProjetFilters,
  ProjetListResponse,
  ProjetStats,
  Magasin,
  CreateMagasinData,
  CompteAssocie,
  StatsQuantitesArticlesResponse,
} from "../../types/project";

// Service principal pour les projets - utilise l'API EEBTP
export const projetService = {
  // Méthodes de base
  getProjets: (filters: ProjetFilters = {}): Promise<ProjetListResponse> => {
    return projetApiService.getProjets(filters);
  },

  getProjetById: (id: number): Promise<Projet> => {
    return projetApiService.getProjetById(id);
  },

  createProjet: (data: CreateProjetData): Promise<Projet> => {
    return projetApiService.createProjet(data);
  },

  updateProjet: (data: UpdateProjetData): Promise<Projet> => {
    return projetApiService.updateProjet(data);
  },

  deleteProjet: (id: number): Promise<void> => {
    return projetApiService.deleteProjet(id);
  },

  getProjetStats: (): Promise<ProjetStats> => {
    return projetApiService.getProjetStats();
  },

  // Méthodes pour les magasins
  getProjetMagasins: (projetId: number): Promise<Magasin[]> => {
    return projetApiService.getProjetMagasins(projetId);
  },

  addMagasinToProjet: (
    projetId: number,
    magasinData: CreateMagasinData,
    creatorId?: number
  ): Promise<Magasin> => {
    return projetApiService.addMagasinToProjet(
      projetId,
      magasinData,
      creatorId
    );
  },

  removeMagasinFromProjet: (
    projetId: number,
    magasinId: number
  ): Promise<void> => {
    return projetApiService.removeMagasinFromProjet(projetId, magasinId);
  },

  // Méthodes pour les comptes associés
  getProjetComptes: (projetId: number): Promise<CompteAssocie[]> => {
    return projetApiService.getProjetComptes(projetId);
  },

  // Méthodes pour les photos
  getProjetPhotos: (projetId: number): Promise<ApiProjetPhoto[]> => {
    return projetApiService.getProjetPhotos(projetId);
  },

  addPhotoToProjet: (
    projetId: number,
    photo: File,
    description?: string
  ): Promise<ApiProjetPhoto> => {
    return projetApiService.addPhotoToProjet(projetId, photo, description);
  },

  deleteProjetPhoto: (photoId: number): Promise<void> => {
    return projetApiService.deleteProjetPhoto(photoId);
  },

  // Méthode pour les statistiques de quantités d'articles
  getStatsQuantitesArticles: (
    projetId: number
  ): Promise<StatsQuantitesArticlesResponse> => {
    return projetApiService.getStatsQuantitesArticles(projetId);
  },
};

export default projetService;
