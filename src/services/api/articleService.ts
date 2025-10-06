import type {
  StockArticle,
  CreateStockArticleData,
  UpdateStockArticleData,
  StockArticleFilter,
} from "../../types/magasin";
import type { PaginatedResponse } from "../../types";
import { articleApiService } from "./articleApiService";
import {
  apiProduitToStockArticle,
  createArticleDataToApiRequest,
  updateArticleDataToApiRequest,
} from "../../types/api-transformers-articles";

export class ArticleService {
  /**
   * Récupérer la liste des articles avec filtrage
   */
  async getArticles(
    magasinId: number,
    filter?: StockArticleFilter
  ): Promise<PaginatedResponse<StockArticle>> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      try {
        const apiArticles = await articleApiService.getArticles();

        // Convertir vers StockArticle et appliquer les filtres
        let articles = apiArticles.map((apiArticle) => {
          const stockArticle = apiProduitToStockArticle(apiArticle);
          // Définir le magasin_id selon le contexte
          stockArticle.magasin_id = magasinId;
          return stockArticle;
        });

        // Appliquer les filtres
        if (filter?.search) {
          const search = filter.search.toLowerCase();
          articles = articles.filter(
            (article) =>
              article.name.toLowerCase().includes(search) ||
              article.description?.toLowerCase().includes(search)
          );
        }

        if (filter?.etat) {
          articles = articles.filter((article) => article.etat === filter.etat);
        }

        if (filter?.type_enum) {
          articles = articles.filter(
            (article) => article.type_enum === filter.type_enum
          );
        }

        return {
          data: articles,
          pagination: {
            page: 1,
            limit: 50,
            total: articles.length,
            totalPages: 1,
          },
        };
      } catch (error) {
        console.error("❌ Erreur API, utilisation des données mock:", error);
        return mockArticleService.getArticles(magasinId, filter);
      }
    }
    return mockArticleService.getArticles(magasinId, filter);
  }

  /**
   * Récupérer un article par son ID
   */
  async getArticle(id: number): Promise<StockArticle> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      try {
        const apiArticle = await articleApiService.getArticle(id);
        return apiProduitToStockArticle(apiArticle);
      } catch (error) {
        console.error("❌ Erreur API, utilisation des données mock:", error);
        return mockArticleService.getArticle(id);
      }
    }
    return mockArticleService.getArticle(id);
  }

  /**
   * Créer un nouvel article
   */
  async createArticle(data: CreateStockArticleData): Promise<StockArticle> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      try {
        const apiRequest = createArticleDataToApiRequest(data);
        const apiArticle = await articleApiService.createArticle(apiRequest);
        const stockArticle = apiProduitToStockArticle(apiArticle);

        // Conserver les données du formulaire qui ne sont pas dans l'API Produit
        stockArticle.magasin_id = data.magasin_id;
        stockArticle.quantite = data.quantite;
        stockArticle.quantite_seuil = data.quantite_seuil;
        stockArticle.etat = data.etat;
        stockArticle.prix_unitaire = data.prix_unitaire || 0;

        return stockArticle;
      } catch (error) {
        console.error("❌ Erreur API lors de la création:", error);
        throw error;
      }
    }
    throw new Error("API non activée, impossible de créer l'article");
  }

  /**
   * Mettre à jour un article existant
   */
  async updateArticle(data: UpdateStockArticleData): Promise<StockArticle> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      try {
        const apiRequest = updateArticleDataToApiRequest(data);
        const apiArticle = await articleApiService.updateArticle(
          data.id,
          apiRequest
        );
        const stockArticle = apiProduitToStockArticle(apiArticle);

        // Conserver les données du formulaire qui ne sont pas dans l'API Produit
        stockArticle.magasin_id = data.magasin_id || stockArticle.magasin_id;
        stockArticle.quantite = data.quantite ?? stockArticle.quantite;
        stockArticle.quantite_seuil =
          data.quantite_seuil ?? stockArticle.quantite_seuil;
        stockArticle.etat = data.etat || stockArticle.etat;
        stockArticle.prix_unitaire =
          data.prix_unitaire ?? stockArticle.prix_unitaire;

        return stockArticle;
      } catch (error) {
        console.error("❌ Erreur API lors de la mise à jour:", error);
        throw error;
      }
    }
    throw new Error("API non activée, impossible de mettre à jour l'article");
  }

  /**
   * Supprimer un article
   */
  async deleteArticle(id: number): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      try {
        await articleApiService.deleteArticle(id);
      } catch (error) {
        console.error("❌ Erreur API lors de la suppression:", error);
        throw error;
      }
    }
    throw new Error("API non activée, impossible de supprimer l'article");
  }
}

// Service mock pour le développement
const mockArticleService = {
  articles: [] as StockArticle[],

  async getArticles(
    _magasinId: number,
    _filter?: StockArticleFilter
  ): Promise<PaginatedResponse<StockArticle>> {
    return {
      data: this.articles,
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  },

  async getArticle(id: number): Promise<StockArticle> {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      throw new Error(`Article ${id} not found`);
    }
    return article;
  },

  async createArticle(data: CreateStockArticleData): Promise<StockArticle> {
    const newArticle: StockArticle = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      quantite: data.quantite,
      quantite_seuil: data.quantite_seuil,
      etat: data.etat,
      type_enum: data.type_enum,
      prix_unitaire: data.prix_unitaire || 0,
      date_creation: new Date(),
      date_modif: new Date(),
      user_id: 1,
      magasin_id: data.magasin_id,
      project_id: data.project_id,
    };
    this.articles.push(newArticle);
    return newArticle;
  },

  async updateArticle(data: UpdateStockArticleData): Promise<StockArticle> {
    const index = this.articles.findIndex((a) => a.id === data.id);
    if (index === -1) {
      throw new Error(`Article ${data.id} not found`);
    }

    this.articles[index] = {
      ...this.articles[index],
      ...data,
      date_modif: new Date(),
    };

    return this.articles[index];
  },

  async deleteArticle(id: number): Promise<void> {
    const index = this.articles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Article ${id} not found`);
    }
    this.articles.splice(index, 1);
  },
};

export const articleService = new ArticleService();
