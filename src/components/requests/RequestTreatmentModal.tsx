import { useState } from "react";
import { Modal, ModalButton } from "../layout";

interface RequestTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { traitement: string; motif: string }) => void;
  article: string;
  quantite: number;
}

export default function RequestTreatmentModal({
  isOpen,
  onClose,
  onSubmit,
  article,
  quantite,
}: RequestTreatmentModalProps) {
  const [traitement, setTraitement] = useState("");
  const [motif, setMotif] = useState("");

  const handleSubmit = () => {
    onSubmit({ traitement, motif });
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
          <ModalButton variant="primary" onClick={handleSubmit}>
            Valider
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
          <label className="block text-xs text-gray-500 mb-1">Traitement</label>
          <select
            className="w-full rounded-lg px-3 py-2 bg-gray-100"
            value={traitement}
            onChange={(e) => setTraitement(e.target.value)}
          >
            <option value="">Sélectionner</option>
            <option value="approuve">Approuver</option>
            <option value="refuse">Refuser</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Motif</label>
          <textarea
            className="w-full rounded-lg px-3 py-2 bg-gray-100"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
