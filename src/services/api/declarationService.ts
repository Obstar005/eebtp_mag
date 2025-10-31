import { declarationApiService } from "./declarationApiService";
import type {
  Declaration,
  CreateDeclarationData,
  UpdateDeclarationData,
  DeclarationFilter,
  DeclarationStats,
  PaginatedResponse,
  PeriodeType,
} from "../../types";

/**
 * Service principal pour les déclarations
 * Utilise soit l'API réelle soit des données mockées selon la configuration
 */
class DeclarationService {
  // Récupérer les déclarations d'un magasin
  async getDeclarations(
    magasinId: number,
    filter?: DeclarationFilter
  ): Promise<PaginatedResponse<Declaration>> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.getDeclarations(magasinId, filter);
    }
    return mockDeclarationService.getDeclarations(magasinId, filter);
  }

  // Récupérer une déclaration par ID
  async getDeclaration(id: number): Promise<Declaration> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.getDeclaration(id);
    }
    return mockDeclarationService.getDeclaration(id);
  }

  // Créer une déclaration
  async createDeclaration(data: CreateDeclarationData): Promise<Declaration> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.createDeclaration(data);
    }
    return mockDeclarationService.createDeclaration(data);
  }

  // Mettre à jour une déclaration
  async updateDeclaration(data: UpdateDeclarationData): Promise<Declaration> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.updateDeclaration(data);
    }
    return mockDeclarationService.updateDeclaration(data);
  }

  // Supprimer une déclaration
  async deleteDeclaration(id: number): Promise<void> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.deleteDeclaration(id);
    }
    return mockDeclarationService.deleteDeclaration(id);
  }

  // Statistiques des déclarations
  async getDeclarationStats(
    magasinId: number,
    periode: PeriodeType = "total"
  ): Promise<DeclarationStats> {
    if (import.meta.env.VITE_ENABLE_VERIFICATION === "true") {
      return await declarationApiService.getDeclarationStats(
        magasinId,
        periode
      );
    }
    return mockDeclarationService.getDeclarationStats(magasinId);
  }
}

// Service mocké pour le développement
const mockDeclarationService = {
  // Récupérer les déclarations d'un magasin
  getDeclarations: async (
    magasinId: number,
    filter?: DeclarationFilter
  ): Promise<PaginatedResponse<Declaration>> => {
    // Mock data pour les déclarations
    const mockDeclarations: Declaration[] = Array.from(
      { length: 10 },
      (_, i) => ({
        id: i + 1,
        type_enum: i % 3 === 0 ? "entree" : i % 3 === 1 ? "sortie" : "retour",
        stock_item_id: 1,
        quantite_float: 80,
        date_creation: new Date("2025-07-01"),
        date_modif: new Date("2025-07-01"),
        date_approbation: new Date("2025-07-01"),
        date_voeux_livrer_string: "01-01-2025 à 3h00",
        user_id: 1,
        magasin_id: magasinId,
        stockItem: {
          id: 1,
          name: "Ciment",
          description: "Ciment Portland",
        },
        user: {
          id: 1,
          name: "John",
          surname: "Doe",
        },
        magasin: {
          id: magasinId,
          name: "MAG-001",
        },
        fournisseur:
          i % 3 === 0
            ? {
                id: 1,
                name: "CIMCO",
                telephone: "+228 90909090",
              }
            : undefined,
        receveur:
          i % 3 === 1
            ? {
                name: "Nom du receveur",
                fonction: "Fonction du receveur",
                telephone: "+228 90909090",
              }
            : undefined,
        deposant:
          i % 3 === 2
            ? {
                name: "Nom du déposant",
                fonction: "Fonction du déposant",
                telephone: "+228 90909090",
              }
            : undefined,
        motif: i % 3 === 2 ? "Motif" : undefined,
      })
    );

    // Filtres
    let filteredDeclarations = mockDeclarations;

    if (filter?.search) {
      filteredDeclarations = filteredDeclarations.filter((decl) =>
        decl.stockItem?.name
          .toLowerCase()
          .includes(filter.search!.toLowerCase())
      );
    }

    if (filter?.type_enum) {
      filteredDeclarations = filteredDeclarations.filter(
        (decl) => decl.type_enum === filter.type_enum
      );
    }

    return {
      data: filteredDeclarations,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredDeclarations.length,
        totalPages: 1,
      },
    };
  },

  // Récupérer une déclaration par ID
  getDeclaration: async (id: number): Promise<Declaration> => {
    return {
      id,
      type_enum: "entree",
      stock_item_id: 1,
      quantite_float: 80,
      date_creation: new Date("2025-07-10"),
      date_modif: new Date("2025-07-10"),
      date_approbation: new Date("2025-07-10"),
      date_voeux_livrer_string: "10 juillet 2025",
      user_id: 1,
      magasin_id: 1,
      stockItem: {
        id: 1,
        name: "Ciment",
        description: "Ciment Portland pour construction",
      },
      user: {
        id: 1,
        name: "John",
        surname: "Doe",
      },
      magasin: {
        id: 1,
        name: "MAG-001",
      },
      fournisseur: {
        id: 1,
        name: "CIMCO",
        telephone: "+228 90909090",
      },
    };
  },

  // Créer une déclaration
  createDeclaration: async (
    data: CreateDeclarationData
  ): Promise<Declaration> => {
    console.log("Création déclaration:", data);
    return {
      id: Date.now(),
      type_enum: data.type_enum,
      stock_item_id: data.stock_item_id,
      quantite_float: data.quantite_float,
      date_creation: new Date(),
      date_modif: new Date(),
      date_voeux_livrer_string: data.date_voeux_livrer_string,
      user_id: 1,
      magasin_id: data.magasin_id,
      fournisseur: data.fournisseur
        ? { ...data.fournisseur, id: 1 }
        : undefined,
      receveur: data.receveur,
      deposant: data.deposant,
      motif: data.motif,
    };
  },

  // Mettre à jour une déclaration
  updateDeclaration: async (
    data: UpdateDeclarationData
  ): Promise<Declaration> => {
    console.log("Mise à jour déclaration:", data);
    return {
      id: data.id,
      type_enum: data.type_enum || "entree",
      stock_item_id: data.stock_item_id || 1,
      quantite_float: data.quantite_float || 0,
      date_creation: new Date("2025-07-10"),
      date_modif: new Date(),
      date_approbation: data.date_approbation,
      date_voeux_livrer_string: data.date_voeux_livrer_string,
      user_id: 1,
      magasin_id: 1,
      fournisseur: data.fournisseur
        ? { ...data.fournisseur, id: 1 }
        : undefined,
      receveur: data.receveur,
      deposant: data.deposant,
      motif: data.motif,
    };
  },

  // Supprimer une déclaration
  deleteDeclaration: async (id: number): Promise<void> => {
    console.log("Suppression déclaration:", id);
  },

  // Statistiques des déclarations
  getDeclarationStats: async (
    _magasinId: number
  ): Promise<DeclarationStats> => {
    return {
      totalEntrees: 2420,
      totalSorties: 2420,
      totalRetours: 2420,
      variationVsHier: {
        entrees: -30,
        sorties: -25,
        retours: 20,
      },
    };
  },
};

export const declarationService = new DeclarationService();
