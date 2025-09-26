import { apiClient as client } from "./client";
import {
  apiProjetToProjet,
  apiMagasinToMagasin,
  createProjetDataToApiCreateProjet,
  updateProjetDataToApiUpdateProjet,
  createMagasinDataToApiCreateMagasin,
  apiProjetsArrayToProjetListResponse,
} from "./api-transformers";
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ProjetFilters,
  ProjetListResponse,
  ProjetStats,
  Magasin,
  CreateMagasinData,
} from "../../types/project";
import type { ApiProjet, ApiMagasin } from "../../types/api-projets";

// Service API pour les projets - utilise les endpoints de l'API EEBTP
export class ProjetApiService {
  private basePath = "/Projets";

  // Récupérer tous les projets avec filtres
  async getProjets(filters: ProjetFilters = {}): Promise<ProjetListResponse> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.pays) params.append("pays", filters.pays);
    if (filters.chef_projet_id)
      params.append("chef_projet_id", filters.chef_projet_id.toString());
    if (filters.date_debut_from)
      params.append("date_debut_from", filters.date_debut_from);
    if (filters.date_debut_to)
      params.append("date_debut_to", filters.date_debut_to);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    try {
      // L'API retourne directement un tableau de projets, pas un objet avec pagination
      const response = await client.get<ApiProjet[]>(
        `${this.basePath}/liste-projets?${params.toString()}`
      );

      console.log("Réponse API projets:", response.data);

      return apiProjetsArrayToProjetListResponse(
        response.data,
        filters.page || 1,
        filters.limit || 10
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
  }

  // Récupérer un projet par ID
  async getProjetById(id: number): Promise<Projet> {
    const response = await client.get<ApiProjet>(
      `${this.basePath}/projet-detail/${id}`
    );
    return apiProjetToProjet(response.data);
  }

  // Créer un nouveau projet
  async createProjet(data: CreateProjetData): Promise<Projet> {
    const apiData = createProjetDataToApiCreateProjet(data);

    const response = await client.post<ApiProjet>(
      `${this.basePath}/projet-create`,
      apiData
    );
    return apiProjetToProjet(response.data);
  }

  // Mettre à jour un projet
  async updateProjet(data: UpdateProjetData): Promise<Projet> {
    const apiData = updateProjetDataToApiUpdateProjet(data);

    const response = await client.put<ApiProjet>(
      `${this.basePath}/projet-update/${data.id}`,
      apiData
    );
    return apiProjetToProjet(response.data);
  }

  // Supprimer un projet
  async deleteProjet(id: number): Promise<void> {
    await client.delete(`${this.basePath}/projet-delete/${id}`);
  }

  // Récupérer les statistiques des projets
  async getProjetStats(): Promise<ProjetStats> {
    // L'API ne semble pas avoir d'endpoint de stats, on simule avec la liste
    const response = await client.get<ApiProjet[]>(
      `${this.basePath}/liste-projets`
    );

    // Calculer les stats à partir de la liste complète
    const projets = response.data;
    const stats = {
      total: projets.length,
      planifies: 0,
      en_cours: 0,
      termines: 0,
      annules: 0, // Pour l'instant, tous les projets sont considérés comme actifs
      par_pays: [] as Array<{ pays: string; count: number }>,
    };

    const paysCounts: Record<string, number> = {};

    projets.forEach((projet) => {
      const now = new Date();
      const debut = new Date(projet.date_debut);
      const fin = projet.date_fin
        ? new Date(projet.date_fin)
        : new Date(debut.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours par défaut

      // Calculer le statut
      if (debut > now) stats.planifies++;
      else if (fin < now) stats.termines++;
      else stats.en_cours++;

      // Compter par pays
      paysCounts[projet.pays] = (paysCounts[projet.pays] || 0) + 1;
    });

    // Convertir les compteurs de pays
    stats.par_pays = Object.entries(paysCounts).map(([pays, count]) => ({
      pays,
      count,
    }));

    return stats;
  }

  // Récupérer les magasins d'un projet
  async getProjetMagasins(projetId: number): Promise<Magasin[]> {
    const response = await client.get<ApiMagasin[]>(
      `${this.basePath}/liste-magasins?projet=${projetId}`
    );
    return response.data.map(apiMagasinToMagasin);
  }

  // Ajouter un magasin à un projet
  async addMagasinToProjet(
    projetId: number,
    magasinData: CreateMagasinData
  ): Promise<Magasin> {
    const apiData = createMagasinDataToApiCreateMagasin(magasinData, projetId);
    const response = await client.post<ApiMagasin>(
      `${this.basePath}/magasin-create`,
      apiData
    );
    return apiMagasinToMagasin(response.data);
  }

  // Supprimer un magasin d'un projet
  async removeMagasinFromProjet(
    _projetId: number,
    magasinId: number
  ): Promise<void> {
    await client.delete(`${this.basePath}/magasin-delete/${magasinId}`);
  }
}

export const projetApiService = new ProjetApiService();
