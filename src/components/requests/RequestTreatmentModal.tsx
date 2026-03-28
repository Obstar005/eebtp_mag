import { useState, useEffect } from "react";
import { Modal, ModalButton } from "../layout";
import { useAccess } from "../../hooks/useAccessPermissions";
import { formatUnit } from "../../utils/formatUtils";
import { Check, X, AlertTriangle } from "lucide-react";
import { REQUEST_STATUS } from "../../utils/permissions";

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
  unite?: string;
  isLoading?: boolean;
  requestStatus: string;
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
  const { demande, isLoading: isLoadingPermissions } = useAccess();
  const [commentaire, setCommentaire] = useState("");
  const [quantiteAjustee, setQuantiteAjustee] = useState<number | "">(quantite);
  const [coutTotal, setCoutTotal] = useState<number | "">("");
  const [selectedAction, setSelectedAction] = useState<
    "positive" | "reject" | null
  >(null);

  // Réinitialiser quand le modal s'ouvre ou que la quantité change
  useEffect(() => {
    setQuantiteAjustee(quantite);
    setCommentaire("");
    setCoutTotal("");
    setSelectedAction(null);
  }, [quantite, isOpen]);

  // Déterminer l'action positive disponible selon le statut et les permissions
  const getPositiveAction = (): {
    value: string;
    label: string;
    buttonLabel: string;
  } | null => {
    if (requestStatus === REQUEST_STATUS.EMISE && demande.canConfirm) {
      return {
        value: "confirmer",
        label: "Confirmer la demande",
        buttonLabel: "Confirmer",
      };
    }
    if (requestStatus === REQUEST_STATUS.CONFIRMEE && demande.canApprove) {
      return {
        value: "approuver",
        label: "Approuver la demande",
        buttonLabel: "Approuver",
      };
    }
    if (requestStatus === REQUEST_STATUS.APPROUVEE && demande.canValidate) {
      return {
        value: "valider",
        label: "Valider la demande",
        buttonLabel: "Valider",
      };
    }
    return null;
  };

  // Vérifier si l'utilisateur peut rejeter à cette étape
  const canReject = (): boolean => {
    if (requestStatus === REQUEST_STATUS.EMISE && demande.canConfirm)
      return true;
    if (requestStatus === REQUEST_STATUS.CONFIRMEE && demande.canApprove)
      return true;
    if (requestStatus === REQUEST_STATUS.APPROUVEE && demande.canValidate)
      return true;
    return false;
  };

  const positiveAction = getPositiveAction();
  const canRejectRequest = canReject();
  const hasAnyAction = positiveAction !== null || canRejectRequest;

  // Déterminer si on affiche le champ quantité (approbation et validation)
  const showQuantiteField =
    selectedAction === "positive" &&
    (requestStatus === REQUEST_STATUS.CONFIRMEE ||
      requestStatus === REQUEST_STATUS.APPROUVEE);

  // Déterminer si on affiche le champ coût total (validation uniquement)
  const showCoutTotalField =
    selectedAction === "positive" && requestStatus === REQUEST_STATUS.APPROUVEE;

  // Le commentaire est obligatoire uniquement pour le rejet
  const isCommentaireRequired = selectedAction === "reject";

  const handleSubmit = () => {
    if (!selectedAction) {
      alert("Veuillez sélectionner une action");
      return;
    }

    if (selectedAction === "reject" && !commentaire.trim()) {
      alert("Le motif est obligatoire pour un rejet");
      return;
    }

    const traitement =
      selectedAction === "reject" ? "rejeter" : positiveAction?.value || "";

    onSubmit({
      traitement,
      commentaire,
      quantite:
        showQuantiteField && quantiteAjustee !== ""
          ? quantiteAjustee
          : undefined,
      coutTotal: showCoutTotalField && coutTotal !== "" ? coutTotal : undefined,
    });

    // Réinitialisation après soumission
    setCommentaire("");
    setQuantiteAjustee(quantite);
    setCoutTotal("");
    setSelectedAction(null);
  };

  const getActionTitle = () => {
    if (requestStatus === REQUEST_STATUS.EMISE) return "Confirmation";
    if (requestStatus === REQUEST_STATUS.CONFIRMEE) return "Approbation";
    if (requestStatus === REQUEST_STATUS.APPROUVEE) return "Validation";
    return "Traitement";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${getActionTitle()} de la demande`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <ModalButton variant="secondary" onClick={onClose}>
            Annuler
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !selectedAction ||
              (isCommentaireRequired && !commentaire.trim())
            }
          >
            {isLoading ? "Traitement..." : "Confirmer l'action"}
          </ModalButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Infos de l'article */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Article demandé</p>
              <p className="font-medium text-gray-900">{article}</p>
            </div>
            <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {quantite} {formatUnit(unite)}
            </span>
          </div>
        </div>

        {/* Sélection de l'action */}
        {isLoadingPermissions ? (
          <div className="flex items-center justify-center py-4 gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            Chargement des permissions...
          </div>
        ) : hasAnyAction ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choisissez une action
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Bouton action positive */}
              {positiveAction && (
                <button
                  type="button"
                  onClick={() => setSelectedAction("positive")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedAction === "positive"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700"
                  }`}
                >
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    {positiveAction.buttonLabel}
                  </span>
                </button>
              )}

              {/* Bouton rejeter */}
              {canRejectRequest && (
                <button
                  type="button"
                  onClick={() => setSelectedAction("reject")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedAction === "reject"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-700"
                  }`}
                >
                  <X className="h-5 w-5" />
                  <span className="font-medium">Rejeter</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">
                Aucune action disponible
              </p>
              <p className="text-amber-600 text-sm mt-1">
                Vous n'avez pas les permissions nécessaires pour traiter cette
                demande à son état actuel.
              </p>
            </div>
          </div>
        )}

        {/* Champ de quantité (pour approbation et validation) */}
        {showQuantiteField && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité{" "}
              {requestStatus === REQUEST_STATUS.CONFIRMEE
                ? "approuvée"
                : "validée"}
            </label>
            <input
              type="number"
              className="w-full rounded-lg px-3 py-2.5 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Quantité demandée: ${quantite}`}
              value={quantiteAjustee}
              onChange={(e) =>
                setQuantiteAjustee(e.target.value ? Number(e.target.value) : "")
              }
              min={0}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Vous pouvez ajuster la quantité à la hausse ou à la baisse
            </p>
          </div>
        )}

        {/* Champ de coût total (validation uniquement) */}
        {showCoutTotalField && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coût total approximatif (FCFA)
            </label>
            <input
              type="number"
              className="w-full rounded-lg px-3 py-2.5 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Montant en FCFA"
              value={coutTotal}
              onChange={(e) =>
                setCoutTotal(e.target.value ? Number(e.target.value) : "")
              }
              min={0}
            />
          </div>
        )}

        {/* Champ commentaire */}
        {selectedAction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedAction === "reject" ? (
                <>
                  Motif du rejet <span className="text-red-500">*</span>
                </>
              ) : (
                "Commentaire (optionnel)"
              )}
            </label>
            <textarea
              className={`w-full rounded-lg px-3 py-2.5 bg-white border focus:outline-none focus:ring-2 focus:border-transparent ${
                selectedAction === "reject"
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder={
                selectedAction === "reject"
                  ? "Expliquez la raison du rejet..."
                  : "Ajoutez un commentaire si nécessaire..."
              }
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              required={selectedAction === "reject"}
            />
            {selectedAction === "reject" && (
              <p className="text-xs text-red-600 mt-1.5">
                Le motif est obligatoire pour rejeter une demande
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
