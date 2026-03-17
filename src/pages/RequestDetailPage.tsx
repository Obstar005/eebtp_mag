import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { ArrowLeft, X, Eye } from "lucide-react";
import { toast } from "react-toast";
import RequestTreatmentModal from "../components/requests/RequestTreatmentModal";
import { useDemande, useTraiterDemande } from "../hooks/useDemandes";
import { useAccess } from "../hooks/useAccessPermissions";
import { showErrorMessage, logError } from "../utils/errorHandling";
import { mapApiStatusToPermissionStatus } from "../utils/permissions";
import { getStatusBadge, getStatusIcon } from "../utils/statutUtils";
import { RequestStatusLabels, type RequestTreatment } from "../types";
import { formatUnit } from "../utils/formatUtils";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canTreatDemande } = useAccess();
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] =
    useState<RequestTreatment | null>(null);

  // Récupération des données de la demande depuis l'API
  const { data: request, isLoading, error } = useDemande(id!);

  // Mutation pour traiter la demande
  const { mutate: traiterDemande, isPending: isTraitementLoading } =
    useTraiterDemande();

  // Déterminer si l'utilisateur peut traiter cette demande (basé sur les accès API)
  const canTreatRequest = (() => {
    const apiStatus = request?.status || "";
    const mappedStatus = mapApiStatusToPermissionStatus(apiStatus);
    return canTreatDemande(mappedStatus);
  })();

  const handleOpenTreatmentModal = () => setIsTreatmentModalOpen(true);
  const handleCloseTreatmentModal = () => setIsTreatmentModalOpen(false);
  const handleSubmitTreatment = (data: {
    traitement: string;
    commentaire: string;
    quantite?: number;
    coutTotal?: number;
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
        commentaire: data.commentaire,
        quantite: data.quantite,
        coutTotal: data.coutTotal,
      },
      {
        onSuccess: () => {
          toast.success("Demande traitée avec succès !");
          handleCloseTreatmentModal();
        },
        onError: (error: unknown) => {
          toast.error("Erreur lors du traitement de la demande");
          logError("Traitement de demande", error);
          showErrorMessage(error);
        },
      },
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Détails de la demande N° {request.id}
        </h1>
        {canTreatRequest && (
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
        )}
      </div>
      <RequestTreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={handleCloseTreatmentModal}
        onSubmit={handleSubmitTreatment}
        article={request.demande}
        quantite={request.quantiteDemandee}
        unite={request.unite}
        isLoading={isTraitementLoading}
        requestStatus={mapApiStatusToPermissionStatus(request.status)}
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
                value={request.nomMagasin ?? "-"}
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
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Coût total approx.
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={
                  request.coutTotalApprox !== undefined
                    ? `${request.coutTotalApprox} XOF`
                    : "-"
                }
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Durée de traitement
              </label>
              <input
                className="w-full rounded-lg px-3 py-2 bg-gray-100"
                value={request.dureeTraitement ?? "-"}
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
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Détails</th>
                </tr>
              </thead>
              <tbody>
                {request.traitements?.map((t) => (
                  <tr key={t.id} className="border-t border-gray-200">
                    <td className="py-2">{t.nom}</td>
                    <td className="py-2">{t.profil}</td>
                    <td className="py-2">
                      <span className={getStatusBadge(t.action)}>
                        {getStatusIcon(t.action)}
                        {RequestStatusLabels[t.action]}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => setSelectedTreatment(t)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal détails du traitement */}
          {selectedTreatment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Détails du traitement
                  </h3>
                  <button
                    onClick={() => setSelectedTreatment(null)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Nom</span>
                      <p className="font-medium">{selectedTreatment.nom}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Profil</span>
                      <p className="font-medium">{selectedTreatment.profil}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Action</span>
                    <p>
                      <span
                        className={getStatusBadge(selectedTreatment.action)}
                      >
                        {getStatusIcon(selectedTreatment.action)}
                        {RequestStatusLabels[selectedTreatment.action]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Commentaire</span>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">
                      {selectedTreatment.commentaire || "Aucun commentaire"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Quantité</span>
                    <p className="font-medium">
                      {selectedTreatment.quantite !== undefined
                        ? selectedTreatment.quantite
                        : "-"}
                    </p>
                  </div>
                  {selectedTreatment.date && (
                    <div>
                      <span className="text-xs text-gray-500">Date</span>
                      <p className="text-gray-700">
                        {new Date(selectedTreatment.date).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedTreatment(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  {formatUnit(request.unite)}
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
                  {formatUnit(request.unite)}
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
                className="w-full rounded-lg px-3 py-2 bg-gray-100 border-none"
                value={request.motif}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
