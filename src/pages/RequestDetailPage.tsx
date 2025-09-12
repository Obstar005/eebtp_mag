import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { MaterialRequest, RequestTreatment } from "../types/request";
import { Truck } from "lucide-react";
import RequestTreatmentModal from "../components/requests/RequestTreatmentModal";

// MOCK pour la démo
const mockRequest: MaterialRequest = {
  id: "DEM-001",
  demande: "Ciment",
  nomMagasinier: "John Doe",
  quantiteDemandee: 80,
  profil: "Magasinier",
  status: "emis",
  dateDemande: "01-01-2025 à 3h00",
  createdAt: "2025-01-01T03:00:00Z",
  updatedAt: "2025-01-01T03:00:00Z",
  nomMagasin: "John Doe",
  nomProjet: "John Doe",
  adresseMagasin: "John Doe",
  donneurOrdre: "John Doe",
  quantiteValidee: undefined,
  motif: "Motif de la demande",
  observation: "Observation de la demande par le chef appro",
  traitements: [
    {
      id: "1",
      nom: "John Doe",
      profil: "Directeur Technique",
      action: "approuve",
      date: "2025-01-01T03:00:00Z",
    },
    {
      id: "2",
      nom: "John Doe",
      profil: "Chef Appro",
      action: "valide",
      date: "2025-01-01T03:00:00Z",
    },
  ],
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request] = useState<MaterialRequest>(mockRequest);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

  const handleOpenTreatmentModal = () => setIsTreatmentModalOpen(true);
  const handleCloseTreatmentModal = () => setIsTreatmentModalOpen(false);
  const handleSubmitTreatment = (data: {
    traitement: string;
    motif: string;
  }) => {
    // TODO: Envoyer le traitement au backend ou mettre à jour l'état
    setIsTreatmentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Détails de la demande N° {request.id}
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleOpenTreatmentModal}
        >
          Traiter la demande
        </button>
      </div>
      <RequestTreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={handleCloseTreatmentModal}
        onSubmit={handleSubmitTreatment}
        article={request.demande}
        quantite={request.quantiteDemandee}
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
