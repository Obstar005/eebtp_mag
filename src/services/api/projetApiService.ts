import { apiClient as client } from "./client";
import {
  apiProjetToProjet,
  apiMagasinToMagasin,
  createProjetDataToApiCreateProjet,
  updateProjetDataToApiUpdateProjet,
  createMagasinDataToApiCreateMagasin,
  apiProjetsArrayToProjetListResponse,
} from "./api-transformers";
import { userApiService } from "./authApiService";
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
  ProjetRole,
} from "../../types/project";
import type {
  ApiProjet,
  ApiMagasin,
  ApiProjetPhoto,
  ApiCreateProjetResponse,
} from "../../types/api-projets";
import type { ApiCustomUser } from "../../types/api-users";

// Service API pour les projets - utilise les endpoints de l'API EEBTP
export class ProjetApiService {
  private basePath = "/Projets";

  // Récupérer tous les projets avec filtres
  async getProjets(filters: ProjetFilters = {}): Promise<ProjetListResponse> {
    const params = new URLSearchParams();

    // Note: l'API ne supporte pas directement le filtrage par 'status'
    // Le statut est calculé côté client en fonction des dates

    if (filters.search) params.append("search", filters.search);
    if (filters.pays) params.append("pays", filters.pays);
    if (filters.chef_projet_id)
      params.append("chef_projet_id", filters.chef_projet_id.toString());
    if (filters.date_debut_from)
      params.append("date_debut_from", filters.date_debut_from);
    if (filters.date_debut_to)
      params.append("date_debut_to", filters.date_debut_to);
    if (filters.date_fin_from)
      params.append("date_fin_from", filters.date_fin_from);
    if (filters.date_fin_to) params.append("date_fin_to", filters.date_fin_to);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    try {
      // L'API retourne directement un tableau de projets, pas un objet avec pagination
      const response = await client.get<ApiProjet[]>(
        `${this.basePath}/liste-projets?${params.toString()}`,
      );

      // Récupérer la liste des utilisateurs pour résoudre les noms
      const usersResponse =
        await client.get<ApiCustomUser[]>("/Users/liste-users");
      const users = usersResponse.data;

      let projets = response.data;

      // Filtrer par statut côté client (calcul en fonction des dates)
      if (filters.status) {
        const now = new Date();
        projets = projets.filter((projet) => {
          const debut = new Date(projet.date_debut);
          const fin = projet.date_fin
            ? new Date(projet.date_fin)
            : new Date(debut.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours par défaut

          if (filters.status === "planifie") {
            return debut > now;
          } else if (filters.status === "en_cours") {
            return debut <= now && fin >= now;
          } else if (filters.status === "termine") {
            return fin < now;
          } else if (filters.status === "annule") {
            // Aucun projet n'est marqué comme annulé pour l'instant
            return false;
          }
          return true;
        });
      }

      return apiProjetsArrayToProjetListResponse(
        projets,
        users,
        filters.page || 1,
        filters.limit || 10,
      );
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un projet par ID
  async getProjetById(id: number): Promise<Projet> {
    const response = await client.get<ApiProjet>(
      `${this.basePath}/projet-detail/${id}`,
    );
    return apiProjetToProjet(response.data);
  }

  // Créer un nouveau projet
  async createProjet(data: CreateProjetData): Promise<Projet> {
    const apiData = createProjetDataToApiCreateProjet(data);

    try {
      // Créer le projet avec son magasin associé en un seul appel
      const response = await client.post<ApiCreateProjetResponse>(
        `${this.basePath}/projet-create`,
        apiData,
      );

      // Extraire le projet de la réponse (la réponse contient { message, projet })
      const apiProjet = response.data.projet;
      const nouveauProjet = apiProjetToProjet(apiProjet);

      // Si l'API a créé automatiquement le magasin, nous n'avons plus besoin de le créer séparément
      // Si des magasins supplémentaires sont spécifiés (au-delà du premier), les créer séparément
      if (data.magasins && data.magasins.length > 1) {
        // Créer les magasins supplémentaires (à partir du deuxième)
        for (let i = 1; i < data.magasins.length; i++) {
          const magasinData = data.magasins[i];
          try {
            const magasinPayload: CreateMagasinData = {
              name: magasinData.name,
              adresse: magasinData.adresse || "",
            };

            await this.addMagasinToProjet(
              nouveauProjet.id,
              magasinPayload,
              data.creator || 1,
            );
          } catch (magasinError) {
            // On continue même si un magasin échoue
          }
        }
      }

      return nouveauProjet;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un projet
  async updateProjet(data: UpdateProjetData): Promise<Projet> {
    const apiData = updateProjetDataToApiUpdateProjet(data);

    const response = await client.put<ApiProjet>(
      `${this.basePath}/projet-update/${data.id}`,
      apiData,
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
      `${this.basePath}/liste-projets`,
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
    // Utiliser l'endpoint spécifique pour récupérer les magasins d'un projet
    const response = await client.get<
      | ApiMagasin[]
      | { data?: ApiMagasin[]; results?: ApiMagasin[]; magasins?: ApiMagasin[] }
    >(`${this.basePath}/liste-magasins-by-projet/${projetId}`);

    // Gérer différents formats de réponse API
    let magasins: ApiMagasin[];

    if (Array.isArray(response.data)) {
      // Si c'est directement un tableau
      magasins = response.data;
    } else if (response.data && typeof response.data === "object") {
      // Si c'est un objet, chercher le tableau dans les clés communes
      magasins =
        response.data.data ||
        response.data.results ||
        response.data.magasins ||
        [];
    } else {
      magasins = [];
    }

    return magasins.map(apiMagasinToMagasin);
  }

  // Ajouter un magasin à un projet
  async addMagasinToProjet(
    projetId: number,
    magasinData: CreateMagasinData,
    creatorId?: number,
  ): Promise<Magasin> {
    const apiData = createMagasinDataToApiCreateMagasin(
      magasinData,
      projetId,
      creatorId,
    );
    const response = await client.post<ApiMagasin>(
      `${this.basePath}/magasin-create`,
      apiData,
    );
    return apiMagasinToMagasin(response.data);
  }

  // Supprimer un magasin d'un projet
  async removeMagasinFromProjet(
    _projetId: number,
    magasinId: number,
  ): Promise<void> {
    await client.delete(`${this.basePath}/magasin-delete/${magasinId}`);
  }

  // Récupérer les comptes associés à un projet
  async getProjetComptes(projetId: number): Promise<CompteAssocie[]> {
    try {
      // 1. Récupérer les détails du projet pour avoir la liste des IDs de comptes
      const projetResponse = await client.get<ApiProjet>(
        `${this.basePath}/projet-detail/${projetId}`,
      );
      const projet = projetResponse.data;

      if (!projet.comptes || projet.comptes.length === 0) {
        return [];
      }

      // 2. Récupérer les détails de chaque utilisateur associé au projet
      const comptesAssocies: CompteAssocie[] = [];
      for (const userId of projet.comptes) {
        try {
          // Convertir l'ID en string pour le service utilisateur
          const userIdStr = userId.toString();
          const userAccount = await userApiService.getUserById(userIdStr);

          // Déterminer le rôle en fonction de l'ID
          let role: ProjetRole = "magasinier"; // Rôle par défaut
          if (userId === projet.creator) {
            role = "chef_projet";
          }

          // Créer l'objet CompteAssocie avec les informations réelles
          comptesAssocies.push({
            userId: userId,
            userName: `${userAccount.prenoms} ${userAccount.nom}`,
            userProfile: userAccount.profile?.nom || "Non défini",
            role: role,
            actions: ["view", "edit"],
          });
        } catch (userError) {
          // Ajouter une version simplifiée en cas d'erreur
          comptesAssocies.push({
            userId: userId,
            userName: `Utilisateur ${userId}`,
            userProfile: "Non disponible",
            role: userId === projet.creator ? "chef_projet" : "magasinier",
            actions: ["view"],
          });
        }
      }

      return comptesAssocies;
    } catch (error) {
      throw new Error("Impossible de récupérer les comptes associés au projet");
    }
  }

  // Récupérer les photos d'un projet
  async getProjetPhotos(projetId: number): Promise<ApiProjetPhoto[]> {
    try {
      const response = await client.get<ApiProjetPhoto[]>(
        `${this.basePath}/liste-photos-by-projet/${projetId}`,
      );
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // Ajouter une photo à un projet
  async addPhotoToProjet(
    projetId: number,
    photo: File,
    description?: string,
  ): Promise<ApiProjetPhoto> {
    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("projet", projetId.toString());
    if (description) {
      formData.append("description", description);
    }

    try {
      const response = await client.post<ApiProjetPhoto>(
        `${this.basePath}/projet-photo-create/${projetId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error("Impossible d'ajouter la photo au projet");
    }
  }

  // Supprimer une photo d'un projet
  async deleteProjetPhoto(photoId: number): Promise<void> {
    try {
      await client.delete(`${this.basePath}/projet-photo-delete/${photoId}`);
    } catch (error) {
      throw new Error("Impossible de supprimer la photo du projet");
    }
  }

  // Récupérer les statistiques de quantités d'articles pour un projet
  async getStatsQuantitesArticles(
    projetId: number
  ): Promise<{ projet: string; magasin: string; articles: Array<{ stock_item_id: number; designation: string; unite: string; quantite: number }> }> {
    try {
      const response = await client.get<{
        projet: string;
        magasin: string;
        articles: Array<{
          stock_item_id: number;
          designation: string;
          unite: string;
          quantite: number;
        }>;
      }>(`${this.basePath}/stats-quantites-articles/${projetId}`);
      return response.data;
    } catch (error) {
      throw new Error("Impossible de récupérer les statistiques des articles");
    }
  }
}

export const projetApiService = new ProjetApiService();
