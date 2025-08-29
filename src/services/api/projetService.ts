import { apiClient as client } from "./client";
import type {
  Projet,
  ProjetWithDetails,
  CreateProjetData,
  UpdateProjetData,
  ProjetFilters,
  ProjetListResponse,
  ProjetStats,
  Magasin,
  CreateMagasinData,
} from "../../types/project";

class ProjetService {
  private basePath = "/projets";

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

    const response = await client.get(`${this.basePath}?${params.toString()}`);
    return response.data;
  }

  // Récupérer un projet par ID
  async getProjetById(id: number): Promise<Projet> {
    const response = await client.get(`${this.basePath}/${id}`);
    return response.data;
  }

  // Créer un nouveau projet
  async createProjet(data: CreateProjetData): Promise<Projet> {
    const formData = new FormData();

    // Ajouter les données du projet
    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        // Gérer les fichiers images séparément
        value.forEach((file: File) => {
          formData.append("images", file);
        });
      } else if (key === "magasins" && Array.isArray(value)) {
        // Sérialiser les magasins en JSON
        formData.append("magasins", JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await client.post(this.basePath, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Mettre à jour un projet
  async updateProjet(data: UpdateProjetData): Promise<Projet> {
    const { id, ...updateData } = data;

    const formData = new FormData();

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file: File) => {
          formData.append("images", file);
        });
      } else if (key === "magasins" && Array.isArray(value)) {
        formData.append("magasins", JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await client.put(`${this.basePath}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Supprimer un projet
  async deleteProjet(id: number): Promise<void> {
    await client.delete(`${this.basePath}/${id}`);
  }

  // Récupérer les statistiques des projets
  async getProjetStats(): Promise<ProjetStats> {
    const response = await client.get(`${this.basePath}/stats`);
    return response.data;
  }

  // Récupérer les magasins d'un projet
  async getProjetMagasins(projetId: number): Promise<Magasin[]> {
    const response = await client.get(`${this.basePath}/${projetId}/magasins`);
    return response.data;
  }

  // Ajouter un magasin à un projet
  async addMagasinToProjet(
    projetId: number,
    magasinData: CreateMagasinData
  ): Promise<Magasin> {
    const response = await client.post(
      `${this.basePath}/${projetId}/magasins`,
      magasinData
    );
    return response.data;
  }

  // Supprimer un magasin d'un projet
  async removeMagasinFromProjet(
    projetId: number,
    magasinId: number
  ): Promise<void> {
    await client.delete(`${this.basePath}/${projetId}/magasins/${magasinId}`);
  }

  // Récupérer tous les pays disponibles pour les projets
  async getAvailableCountries(): Promise<
    Array<{ code: string; name: string }>
  > {
    const response = await client.get(`${this.basePath}/countries`);
    return response.data;
  }
}

// Service mock pour le développement
class MockProjetService extends ProjetService {
  private mockProjets: ProjetWithDetails[] = [
    {
      id: 1,
      name: "Construction École Primaire Lomé",
      description:
        "Projet de construction d'une école primaire dans le quartier de Bè à Lomé",
      date_debut: "2025-01-15",
      date_fin: "2025-12-31",
      pays: "TG",
      status: "en_cours",
      chefProjet: { id: 1, name: "John Doe" },
      directeurTravaux: { id: 2, name: "Jane Smith" },
      chefChantier: { id: 3, name: "Bob Johnson" },
      magasinsCount: 2,
      comptesAssociesCount: 5,
    },
    {
      id: 2,
      name: "Réhabilitation Route Ouagadougou",
      description: "Réhabilitation de la route principale de Ouagadougou",
      date_debut: "2025-03-01",
      date_fin: "2025-08-30",
      pays: "BF",
      status: "planifie",
      chefProjet: { id: 2, name: "Jane Smith" },
      directeurTravaux: { id: 1, name: "John Doe" },
      chefChantier: { id: 4, name: "Alice Brown" },
      magasinsCount: 1,
      comptesAssociesCount: 3,
    },
    {
      id: 3,
      name: "Centre de Santé Kara",
      description: "Construction d'un centre de santé moderne à Kara",
      date_debut: "2024-06-01",
      date_fin: "2024-11-30",
      pays: "TG",
      status: "termine",
      chefProjet: { id: 3, name: "Bob Johnson" },
      directeurTravaux: { id: 4, name: "Alice Brown" },
      chefChantier: { id: 1, name: "John Doe" },
      magasinsCount: 1,
      comptesAssociesCount: 4,
    },
  ];

  private mockMagasins: Magasin[] = [
    {
      id: 1,
      name: "Magasin Central Lomé",
      project_id: 1,
      adresse: "Avenue du Golf, Lomé",
    },
    { id: 2, name: "Dépôt Bè", project_id: 1, adresse: "Quartier Bè, Lomé" },
    {
      id: 3,
      name: "Magasin Ouaga Nord",
      project_id: 2,
      adresse: "Secteur 30, Ouagadougou",
    },
    {
      id: 4,
      name: "Entrepôt Kara",
      project_id: 3,
      adresse: "Route de Bassar, Kara",
    },
  ];

  async getProjets(filters: ProjetFilters = {}): Promise<ProjetListResponse> {
    let filteredProjets = [...this.mockProjets];

    // Filtrage par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredProjets = filteredProjets.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.chefProjet.name.toLowerCase().includes(search)
      );
    }

    // Filtrage par pays
    if (filters.pays) {
      filteredProjets = filteredProjets.filter((p) => p.pays === filters.pays);
    }

    // Filtrage par statut
    if (filters.status) {
      filteredProjets = filteredProjets.filter(
        (p) => p.status === filters.status
      );
    }

    // Filtrage par chef de projet
    if (filters.chef_projet_id) {
      filteredProjets = filteredProjets.filter(
        (p) => p.chefProjet.id === filters.chef_projet_id
      );
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjets = filteredProjets.slice(startIndex, endIndex);

    return {
      data: paginatedProjets,
      total: filteredProjets.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProjets.length / limit),
    };
  }

  async getProjetById(id: number): Promise<Projet> {
    const projet = this.mockProjets.find((p) => p.id === id);
    if (!projet) {
      throw new Error(`Projet avec l'ID ${id} introuvable`);
    }

    // Simuler un projet complet avec toutes les relations
    return {
      id: projet.id,
      name: projet.name,
      description: projet.description,
      date_creation: new Date("2024-12-01"),
      date_debut: new Date(projet.date_debut),
      date_fin: new Date(projet.date_fin),
      date_modif: new Date(),
      date_mise_a_jour: new Date(),
      pays: projet.pays,
      chef_projet_user_id: projet.chefProjet.id,
      directeur_travaux_user_id: projet.directeurTravaux.id,
      chef_chantier_user_id: projet.chefChantier.id,
      coordinateur_travaux_user_id: 5,
      chef_equipe_user_id: 6,
      server_boolean: true,
      images: [
        `/api/projects/${id}/images/image1.jpg`,
        `/api/projects/${id}/images/image2.jpg`,
      ],
      chefProjet: {
        id: projet.chefProjet.id,
        code: `CPT-${projet.chefProjet.id.toString().padStart(3, "0")}`,
        nom: projet.chefProjet.name.split(" ")[1] || "",
        prenoms: projet.chefProjet.name.split(" ")[0] || "",
        nom_utilisateur: projet.chefProjet.name.toLowerCase().replace(" ", "."),
        date_naissance: "1980-01-01",
        nationalite: "TG",
        mot_de_passe: "",
        type: "Interne" as const,
        telephone: "+22890123456",
        is_active: true,
        date_creation: "2024-01-01",
        date_modification: "2024-01-01",
        profile_id: "1",
      },
      magasins: this.mockMagasins.filter((m) => m.project_id === id),
      comptesAssocies: [
        {
          userId: projet.chefProjet.id,
          userName: projet.chefProjet.name,
          userProfile: "Chef Projet",
          role: "chef_projet" as const,
          actions: ["Voir", "Modifier", "Supprimer"],
        },
        {
          userId: projet.directeurTravaux.id,
          userName: projet.directeurTravaux.name,
          userProfile: "Directeur Travaux",
          role: "directeur_travaux" as const,
          actions: ["Voir", "Modifier"],
        },
      ],
    };
  }

  async createProjet(data: CreateProjetData): Promise<Projet> {
    const newId = Math.max(...this.mockProjets.map((p) => p.id)) + 1;

    const nouveauProjet: Projet = {
      id: newId,
      name: data.name,
      description: data.description,
      date_creation: new Date(),
      date_debut: new Date(data.date_debut),
      date_fin: new Date(data.date_fin),
      date_modif: new Date(),
      date_mise_a_jour: new Date(),
      pays: data.pays,
      chef_projet_user_id: data.chef_projet_user_id,
      directeur_travaux_user_id: data.directeur_travaux_user_id,
      chef_chantier_user_id: data.chef_chantier_user_id,
      coordinateur_travaux_user_id: data.coordinateur_travaux_user_id,
      chef_equipe_user_id: data.chef_equipe_user_id,
      server_boolean: true,
      images: data.images ? [`/api/projects/${newId}/images/upload1.jpg`] : [],
    };

    return nouveauProjet;
  }

  async updateProjet(data: UpdateProjetData): Promise<Projet> {
    const existingProjet = await this.getProjetById(data.id);

    return {
      ...existingProjet,
      ...data,
      date_modif: new Date(),
      date_mise_a_jour: new Date(),
    };
  }

  async deleteProjet(id: number): Promise<void> {
    const index = this.mockProjets.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Projet avec l'ID ${id} introuvable`);
    }
    // En mode mock, on ne supprime pas vraiment
    console.log(`Projet ${id} supprimé (mode mock)`);
  }

  async getProjetStats(): Promise<ProjetStats> {
    const stats: ProjetStats = {
      total: this.mockProjets.length,
      planifies: this.mockProjets.filter((p) => p.status === "planifie").length,
      en_cours: this.mockProjets.filter((p) => p.status === "en_cours").length,
      termines: this.mockProjets.filter((p) => p.status === "termine").length,
      par_pays: [
        {
          pays: "TG",
          count: this.mockProjets.filter((p) => p.pays === "TG").length,
        },
        {
          pays: "BF",
          count: this.mockProjets.filter((p) => p.pays === "BF").length,
        },
      ],
    };
    return stats;
  }

  async getProjetMagasins(projetId: number): Promise<Magasin[]> {
    return this.mockMagasins.filter((m) => m.project_id === projetId);
  }

  async addMagasinToProjet(
    projetId: number,
    magasinData: CreateMagasinData
  ): Promise<Magasin> {
    const newId = Math.max(...this.mockMagasins.map((m) => m.id)) + 1;
    const nouveauMagasin: Magasin = {
      id: newId,
      name: magasinData.name,
      project_id: projetId,
      adresse: magasinData.adresse,
    };

    this.mockMagasins.push(nouveauMagasin);
    return nouveauMagasin;
  }

  async removeMagasinFromProjet(
    projetId: number,
    magasinId: number
  ): Promise<void> {
    const index = this.mockMagasins.findIndex(
      (m) => m.id === magasinId && m.project_id === projetId
    );
    if (index !== -1) {
      this.mockMagasins.splice(index, 1);
    }
  }

  async getAvailableCountries(): Promise<
    Array<{ code: string; name: string }>
  > {
    return [
      { code: "TG", name: "Togo" },
      { code: "BF", name: "Burkina Faso" },
      { code: "CI", name: "Côte d'Ivoire" },
      { code: "GH", name: "Ghana" },
      { code: "BJ", name: "Bénin" },
      { code: "NE", name: "Niger" },
    ];
  }
}

// Utiliser le service mock ou réel selon l'environnement
const isUsingMockData = import.meta.env.VITE_USE_MOCK_DATA !== "false";

export const projetService = isUsingMockData
  ? new MockProjetService()
  : new ProjetService();

export default projetService;
