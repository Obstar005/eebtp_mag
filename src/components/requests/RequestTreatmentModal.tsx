import { useState } from "react";
import { Modal, ModalButton } from "../layout";

interface RequestTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { traitement: string; motif: string }) => void;
  article: string;
  quantite: number;
  isLoading?: boolean;
}

export default function RequestTreatmentModal({
  isOpen,
  onClose,
  onSubmit,
  article,
  quantite,
  isLoading = false,
}: RequestTreatmentModalProps) {
  const [traitement, setTraitement] = useState("");
  const [motif, setMotif] = useState("");

  const handleSubmit = () => {
    if (!traitement) {
      alert("Veuillez sélectionner une action de traitement");
      return;
    }

    if (traitement === "rejeter" && !motif) {
      alert("Le motif est obligatoire pour un rejet");
      return;
    }

    onSubmit({ traitement, motif });

    // Réinitialiser les champs après soumission
    setTraitement("");
    setMotif("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Traitement de la demande`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <ModalButton variant="secondary" onClick={onClose}>
            Annuler
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Valider"}
          </ModalButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative w-full">
          <label className="block text-xs text-gray-500 mb-1">Article</label>
          <input
            className="w-full rounded-lg px-3 py-2 bg-gray-100"
            value={article}
            readOnly
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2 origin-center inline-block mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
            {quantite} Kilogramme
          </span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Action de traitement
          </label>
          <select
            className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={traitement}
            onChange={(e) => setTraitement(e.target.value)}
          >
            <option value="">-- Sélectionner une action --</option>
            <option value="confirmer">Confirmer (Chef Appro)</option>
            <option value="approuver">Approuver (Directeur Technique)</option>
            <option value="valider">Valider (Directeur)</option>
            <option value="rejeter">Rejeter la demande</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Motif ou commentaire{" "}
            {traitement === "rejeter" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              traitement === "rejeter"
                ? "Expliquez la raison du rejet (obligatoire)"
                : "Commentaire optionnel sur cette action"
            }
            rows={3}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
