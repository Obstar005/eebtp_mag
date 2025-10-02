// Fonctions manquantes à ajouter à projetService

// Dans le fichier src/services/api/projetService.ts
import { projetApiService } from "./projetApiService";
import { ApiProjetPhoto } from "../../types/api-projets";

// Service principal pour les projets - utilise l'API EEBTP
export const projetService = {
  // Méthodes existantes
  ...projetApiService,

  // Ajout des méthodes de gestion des photos
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
};

export default projetService;
