import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Truck } from "lucide-react";
import RequestTreatmentModal from "../components/requests/RequestTreatmentModal";
import { useDemande, useTraiterDemande } from "../hooks/useDemandes";
import { showErrorMessage, logError } from "../utils/errorHandling";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

  // Récupération des données de la demande depuis l'API
  const { data: request, isLoading, error } = useDemande(id!);

  // Mutation pour traiter la demande
  const { mutate: traiterDemande, isPending: isTraitementLoading } =
    useTraiterDemande();

  const handleOpenTreatmentModal = () => setIsTreatmentModalOpen(true);
  const handleCloseTreatmentModal = () => setIsTreatmentModalOpen(false);
  const handleSubmitTreatment = (data: {
    traitement: string;
    motif: string;
  }) => {
    if (!request || !id) return;

    traiterDemande(
      {
        id: id,
        action: data.traitement as
          | "confirmer"
          | "approuver"
          | "valider"
          | "rejeter",
        motif: data.motif,
      },
      {
        onSuccess: () => {
          handleCloseTreatmentModal();
          // Optionnel : afficher un message de succès
          console.log("✅ Demande traitée avec succès");
        },
        onError: (error: unknown) => {
          logError("Traitement de demande", error);
          showErrorMessage(error);
        },
      }
    );
  };

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center p-8">
          <p className="text-red-600">
            Erreur lors du chargement de la demande
          </p>
          <p className="text-gray-500 mt-2">
            La demande demandée n'existe pas ou n'est plus accessible
          </p>
          <button
            onClick={() => navigate("/requests")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Détails de la demande N° {request.id}
        </h1>
        <button
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            isTraitementLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleOpenTreatmentModal}
          disabled={isTraitementLoading}
        >
          {isTraitementLoading
            ? "Traitement en cours..."
            : "Traiter la demande"}
        </button>
      </div>
      <RequestTreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={handleCloseTreatmentModal}
        onSubmit={handleSubmitTreatment}
        article={request.demande}
        quantite={request.quantiteDemandee}
        isLoading={isTraitementLoading}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne gauche : Détails basiques */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Détails Basiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nom du magasinier
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.nomMagasinier}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nom du magasin
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.nomMagasin}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nom du projet
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-50"
                value={request.nomProjet}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Adresse du magasin
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.adresseMagasin}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Donneur d'ordre
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.donneurOrdre}
                readOnly
              />
            </div>
          </div>
          {/* Traitements */}
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Traitements</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Nom</th>
                  <th className="text-left py-2">Profil</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {request.traitements?.map((t) => (
                  <tr key={t.id} className="border-t border-gray-200">
                    <td className="py-1">{t.nom}</td>
                    <td className="py-1">{t.profil}</td>
                    <td className="py-1 text-blue-600 font-medium flex items-center gap-1">
                      <Truck />
                      {t.action === "approuve"
                        ? "Approuvée"
                        : t.action === "valide"
                        ? "Validée"
                        : t.action === "confirme"
                        ? "Confirmée"
                        : t.action === "refuse"
                        ? "Rejetée"
                        : t.action === "emis"
                        ? "Émise"
                        : t.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Colonne droite : Demande */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Demande</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Article
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.demande}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Quantité demandée
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-100"
                  value={request.quantiteDemandee}
                  readOnly
                />
                <span className="text-white bg-blue-700 px-2 py-1 rounded text-xs">
                  Unité
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Quantité validée
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-lg px-3 py-2 bg-gray-100"
                  value={request.quantiteValidee ?? "-"}
                  readOnly
                />
                <span className="text-white bg-blue-700 px-2 py-1 rounded text-xs">
                  Unité
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.status}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Motif</label>
              <textarea
                className="w-full rounded-lg px-3 py-2 bg-gray-50"
                value={request.motif}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Observation
              </label>
              <textarea
                className="w-full rounded-lg px-3 py-2 bg-gray-50"
                value={request.observation}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
