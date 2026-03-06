import { useState, useMemo, useEffect } from "react";
import { Modal, ModalButton } from "../layout";
import { useAuth } from "../../contexts/AuthContext";
import { useAccess } from "../../hooks/useAccessPermissions";
import { type AvailableAction } from "../../utils/permissions";
import { formatUnit } from "../../utils/formatUtils";

interface RequestTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    traitement: string;
    commentaire: string;
    quantite?: number;
    coutTotal?: number;
  }) => void;
  article: string;
  quantite: number;
  unite?: string; // Unité du stock item
  isLoading?: boolean;
  requestStatus: string; // État actuel de la demande
}

export default function RequestTreatmentModal({
  isOpen,
  onClose,
  onSubmit,
  article,
  quantite,
  unite = "unité(s)",
  isLoading = false,
  requestStatus,
}: RequestTreatmentModalProps) {
  const { user } = useAuth();
  const { getDemandeActions, isLoading: isLoadingPermissions } = useAccess();
  const [traitement, setTraitement] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [quantiteAjustee, setQuantiteAjustee] = useState<number | "">(quantite);
  const [coutTotal, setCoutTotal] = useState<number | "">("");

  // Réinitialiser la quantité lorsque la quantité de la demande change
  useEffect(() => {
    setQuantiteAjustee(quantite);
  }, [quantite]);

  // Déterminer les actions disponibles selon les ACCÈS API de l'utilisateur
  // Utilise le nouveau système basé sur les codes d'accès (demande.confirm, demande.approuv, demande.valid)
  const availableActions = useMemo(() => {
    return getDemandeActions(requestStatus);
  }, [getDemandeActions, requestStatus]);

  // Déterminer si on doit afficher le champ de quantité
  const showQuantiteField =
    traitement === "approuver" || traitement === "valider";

  // Déterminer si on doit afficher le champ de coût total
  const showCoutTotalField = traitement === "valider";

  const handleSubmit = () => {
    if (!traitement) {
      alert("Veuillez sélectionner une action de traitement");
      return;
    }

    if (traitement === "rejeter" && !commentaire) {
      alert("Le motif est obligatoire pour un rejet");
      return;
    }

    onSubmit({
      traitement,
      commentaire,
      quantite:
        showQuantiteField && quantiteAjustee !== ""
          ? quantiteAjustee
          : undefined,
      coutTotal: showCoutTotalField && coutTotal !== "" ? coutTotal : undefined,
    });

    // Réinitialiser les champs après soumission
    setTraitement("");
    setCommentaire("");
    setQuantiteAjustee(quantite);
    setCoutTotal("");
  };

  // Labels dynamiques pour le commentaire selon l'action
  const getCommentaireLabel = () => {
    switch (traitement) {
      case "confirmer":
        return "Commentaire de confirmation";
      case "approuver":
        return "Commentaire d'approbation";
      case "valider":
        return "Commentaire de validation";
      case "rejeter":
        return "Motif de rejet";
      default:
        return "Commentaire";
    }
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
            disabled={isLoading || availableActions.length === 0}
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
            {quantite} {formatUnit(unite)}
          </span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Action de traitement
          </label>
          {isLoadingPermissions ? (
            <div className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Chargement des permissions...
            </div>
          ) : availableActions.length > 0 ? (
            <select
              className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={traitement}
              onChange={(e) => setTraitement(e.target.value)}
            >
              <option value="">-- Sélectionner une action --</option>
              {availableActions.map((action: AvailableAction) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full rounded-lg px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm">
              {!user
                ? "Vous devez être connecté pour traiter cette demande"
                : `Aucune action disponible pour vos accès à l'état "${requestStatus}"`}
            </div>
          )}
        </div>

        {/* Champ de quantité pour approbation et validation */}
        {showQuantiteField && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Quantité {traitement === "approuver" ? "approuvée" : "validée"}
            </label>
            <input
              type="number"
              className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Quantité (demandée: ${quantite})`}
              value={quantiteAjustee}
              onChange={(e) =>
                setQuantiteAjustee(e.target.value ? Number(e.target.value) : "")
              }
              min={0}
            />
            <p className="text-xs text-gray-400 mt-1">
              Laissez vide ou égal à {quantite} pour garder la quantité demandée
            </p>
          </div>
        )}

        {/* Champ de coût total pour validation */}
        {showCoutTotalField && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Coût total approximatif
            </label>
            <input
              type="number"
              className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Montant en FCFA"
              value={coutTotal}
              onChange={(e) =>
                setCoutTotal(e.target.value ? Number(e.target.value) : "")
              }
              min={0}
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {getCommentaireLabel()}{" "}
            {traitement === "rejeter" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            className="w-full rounded-lg px-3 py-2 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              traitement === "rejeter"
                ? "Expliquez la raison du rejet (obligatoire)"
                : `Ajoutez un commentaire pour cette ${traitement || "action"}`
            }
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
