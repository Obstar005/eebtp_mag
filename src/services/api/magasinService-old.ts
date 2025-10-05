import type {
  Magasin,
  CreateMagasinData,
  UpdateMagasinData,
  MagasinFilter,
  StockArticle,
  StockArticleFilter,
  MagasinStats,
} from "../../types/magasin";
import type { PaginatedResponse } from "../../types/api";

class MagasinService {
  // Gestion des magasins
  async getMagasins(
    filter?: MagasinFilter
  ): Promise<PaginatedResponse<Magasin>> {
    // Mock data pour le développement
    const mockMagasins: Magasin[] = [
      {
        id: 1,
        name: "MAG-001",
        adresse: "Accra, Ghana",
        project_id: 1,
        date_creation: new Date("2025-07-10"),
        date_mise_a_jour: new Date("2025-07-10"),
        projet: { id: 1, name: "Projet de construction de duplex" },
        articlesCount: 18,
      },
    ];

    // Filtrage simulé
    let filteredMagasins = mockMagasins;
    if (filter?.search) {
      filteredMagasins = mockMagasins.filter(
        (m) =>
          m.name.toLowerCase().includes(filter.search!.toLowerCase()) ||
          m.adresse?.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }
    if (filter?.project_id) {
      filteredMagasins = filteredMagasins.filter(
        (m) => m.project_id === filter.project_id
      );
    }

    return {
      data: filteredMagasins,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredMagasins.length,
        totalPages: Math.ceil(filteredMagasins.length / 10),
      },
    };
  }

  async getMagasin(id: number): Promise<Magasin> {
    console.log("Récupération magasin:", id);
    // Mock data pour le développement
    return {
      id: 1,
      name: "MAG-001",
      adresse: "Accra, Ghana",
      project_id: 1,
      date_creation: new Date("2025-07-10"),
      date_mise_a_jour: new Date("2025-07-10"),
      projet: { id: 1, name: "Projet de construction de duplex" },
      articlesCount: 18,
    };
  }

  async createMagasin(data: CreateMagasinData): Promise<Magasin> {
    console.log("Création magasin:", data);
    // Mock response
    return {
      id: Date.now(),
      name: data.name,
      adresse: data.adresse,
      project_id: data.project_id,
      date_creation: new Date(),
      date_mise_a_jour: new Date(),
      articlesCount: 0,
    };
  }

  async updateMagasin(data: UpdateMagasinData): Promise<Magasin> {
    console.log("Mise à jour magasin:", data);
    // Mock response
    return {
      id: data.id,
      name: data.name || "MAG-001",
      adresse: data.adresse || "Accra, Ghana",
      project_id: 1,
      date_creation: new Date("2025-07-10"),
      date_mise_a_jour: new Date(),
      articlesCount: 18,
    };
  }

  async deleteMagasin(id: number): Promise<void> {
    console.log("Suppression magasin:", id);
  }

  // Gestion des articles de stock
  async getStockArticles(
    magasinId: number,
    filter?: StockArticleFilter
  ): Promise<PaginatedResponse<StockArticle>> {
    // Mock data pour les articles
    const mockArticles: StockArticle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i + 1,
      name: "Ciment",
      description: "Ciment Portland pour construction",
      quantite: 100,
      quantite_seuil: 20,
      etat: i % 3 === 0 ? "neuf" : i % 3 === 1 ? "usagé" : "abandonné",
      date_creation: new Date("2025-07-10"),
      date_modif: new Date("2025-07-10"),
      user_id: 1,
      magasin_id: magasinId,
      prix_unitaire: 15000,
      user: { id: 1, name: "John", surname: "Doe" },
      magasin: { id: magasinId, name: "MAG-001" },
    }));

    // Filtrage simulé
    let filteredArticles = mockArticles;
    if (filter?.search) {
      filteredArticles = mockArticles.filter((a) =>
        a.name.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }
    if (filter?.etat) {
      filteredArticles = filteredArticles.filter((a) => a.etat === filter.etat);
    }

    return {
      data: filteredArticles,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredArticles.length,
        totalPages: Math.ceil(filteredArticles.length / 20),
      },
    };
  }

  async getStockArticle(id: number): Promise<StockArticle> {
    // Mock data
    return {
      id,
      name: "CIMENT",
      description: "Ciment Portland pour construction",
      quantite: 100,
      quantite_seuil: 20,
      etat: "Neuf",
      date_creation: new Date("2025-07-10"),
      date_modif: new Date("2025-07-10"),
      user_id: 1,
      magasin_id: 1,
      prix_unitaire: 15000,
      user: { id: 1, name: "John", surname: "Doe" },
      magasin: { id: 1, name: "MAG-001" },
    };
  }

  async createStockArticle(
    data: any
  ): Promise<StockArticle> {
    console.log("Création article:", data);
    // Si on reçoit un article_id, on va chercher le nom correspondant dans la liste mock
    let name = data.name;
    if (data.article_id) {
      // Simuler la recherche dans la liste mock
      const mockArticles: StockArticle[] = Array.from(
        { length: 18 },
        (_, i) => ({
          id: i + 1,
          name: "Ciment",
          description: "Ciment Portland pour construction",
          quantite: 100,
          quantite_seuil: 20,
          etat: i % 3 === 0 ? "Neuf" : i % 3 === 1 ? "Usagé" : "Abandonné",
          date_creation: new Date("2025-07-10"),
          date_modif: new Date("2025-07-10"),
          user_id: 1,
          magasin_id: data.magasin_id,
          prix_unitaire: 15000,
          user: { id: 1, name: "John", surname: "Doe" },
          magasin: { id: data.magasin_id, name: "MAG-001" },
        })
      );
      const found = mockArticles.find((a) => a.id === Number(data.article_id));
      name = found ? found.name : "Article inconnu";
    }
    return {
      id: Date.now(),
      name,
      description: data.description,
      quantite: data.quantite,
      quantite_seuil: data.quantite_seuil,
      etat: data.etat,
      type_enum: data.type_enum,
      date_creation: new Date(),
      date_modif: new Date(),
      user_id: 1,
      magasin_id: data.magasin_id,
      project_id: data.project_id,
      prix_unitaire: data.prix_unitaire,
    };
  }

  async updateStockArticle(
    data: any // Accept both {name,...} and {article_id,...}
  ): Promise<StockArticle> {
    console.log("Mise à jour article:", data);
    let name = data.name;
    if (data.article_id) {
      const mockArticles: StockArticle[] = Array.from(
        { length: 18 },
        (_, i) => ({
          id: i + 1,
          name: "Ciment",
          description: "Ciment Portland pour construction",
          quantite: 100,
          quantite_seuil: 20,
          etat: i % 3 === 0 ? "Neuf" : i % 3 === 1 ? "Usagé" : "Abandonné",
          date_creation: new Date("2025-07-10"),
          date_modif: new Date("2025-07-10"),
          user_id: 1,
          magasin_id: 1,
          prix_unitaire: 15000,
          user: { id: 1, name: "John", surname: "Doe" },
          magasin: { id: 1, name: "MAG-001" },
        })
      );
      const found = mockArticles.find((a) => a.id === Number(data.article_id));
      name = found ? found.name : "Article inconnu";
    }
    return {
      id: data.id,
      name: name || "CIMENT",
      description: data.description,
      quantite: data.quantite || 100,
      quantite_seuil: data.quantite_seuil || 20,
      etat: data.etat || "Neuf",
      type_enum: data.type_enum,
      date_creation: new Date("2025-07-10"),
      date_modif: new Date(),
      user_id: 1,
      magasin_id: 1,
      prix_unitaire: data.prix_unitaire,
    };
  }

  async deleteStockArticle(id: number): Promise<void> {
    console.log("Suppression article:", id);
  }

  // Statistiques
  async getMagasinStats(): Promise<MagasinStats> {
    return {
      totalMagasins: 1,
      totalArticles: 18,
      articlesNeuf: 6,
      articlesUsage: 6,
      articlesAbandonne: 6,
    };
  }
}

export const magasinService = new MagasinService();
