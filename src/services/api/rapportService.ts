import { apiClient } from "./client";

/**
 * Service pour la génération de rapports
 */
const rapportService = {
  /**
   * Générer les détails du rapport des stocks pour un projet (JSON)
   * @param projetId - ID du projet
   * @returns Données du rapport
   */
  async genererRapportStocksDetail(projetId: number): Promise<unknown> {
    const response = await apiClient.post(
      `/App/generer-rapport-stocks/${projetId}`
    );

    return response.data;
  },

  /**
   * Générer un rapport PDF des stocks pour un projet
   * @param projetId - ID du projet
   * @returns Blob du fichier PDF
   */
  async genererRapportStocksPDF(projetId: number): Promise<Blob> {
    const response = await apiClient.get(
      `/App/Generer-rapport-stocks-pdf/${projetId}`,
      {
        responseType: "blob", // Important pour récupérer le PDF en tant que blob
      }
    );

    return response.data;
  },

  /**
   * Télécharger le rapport PDF généré
   * @param projetId - ID du projet
   * @param nomProjet - Nom du projet pour le nom du fichier
   */
  async telechargerRapportStocksPDF(
    projetId: number,
    nomProjet?: string
  ): Promise<void> {
    try {
      const blob = await this.genererRapportStocksPDF(projetId);

      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Nom du fichier avec timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = nomProjet
        ? `Rapport_Stocks_${nomProjet}_${timestamp}.pdf`
        : `Rapport_Stocks_Projet_${projetId}_${timestamp}.pdf`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },
};

export default rapportService;
