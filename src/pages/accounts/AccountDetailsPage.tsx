import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  ArrowLeft,
  Eye,
  EyeOff,
  MoreHorizontal,
  Edit2Icon,
} from "lucide-react";
import { useAccount, useDeleteAccount } from "../../hooks";
import { ConfirmationModal, FormModal } from "../../components/layout";
import { useModal } from "../../hooks/useModal";
import { useState } from "react";

export function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { data: account, isLoading, error } = useAccount(id!);
  const deleteAccountMutation = useDeleteAccount();

  const deleteModal = useModal();
  const editModal = useModal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Compte non trouvé</p>
        <Link
          to="/accounts"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteAccountMutation.mutateAsync(account.id);
      navigate("/accounts");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/accounts")}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Détails du compte N°{account.code}
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="flex-3">
          {/* Card principale avec photo et informations */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 relative flex flex-col pt-12">
            {/* bg linear with courbes */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-green-400 rounded-xl absolute top-0 left-0 inset-0 inset-y-1/2 h-32 rounded-b-none z-10"></div>
            <div className="space-y-6 z-20">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 p-1 relative">
                {account.photo ? (
                  <img
                    src={account.photo}
                    alt="Photo de profil"
                    className="w-full h-full object-cover rounded-full border border-blue-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full border border-blue-500">
                    <User className="h-12 w-12" />
                  </div>
                )}

                {/* edit btn */}
                <button
                  onClick={editModal.open}
                  className="absolute bottom-0 right-0 -translate-1/3 origin-center bg-blue-500 p-1 rounded-full shadow hover:bg-bg-600 border border-blue-600"
                  title="Modifier le compte"
                >
                  <Edit2Icon className="h-4 w-4 text-white" />
                </button>
              </div>
              {/* isOnligne badge */}
              <span
                className="absolute top-3/7 right-12 p-1 px-4 text-white bg-green-500 border-2 border-white rounded-full"
                title="En ligne"
              >
                En ligne
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {account.prenoms} {account.nom}
                </h2>
                <div className="space-y-2">
                  {/* Phone number aligned right */}
                  <p className="text-right text-sm text-gray-500">
                    Téléphone: {account.telephone}
                  </p>
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">N° {account.code}</p>
                    <div className="flex gap-6 items-center">
                      {/* created at */}
                      <p className="text-sm text-gray-500">
                        Créé le:{" "}
                        {new Date().toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </p>
                      {/* updated at */}
                      <p className="text-sm text-gray-500">
                        Mis à jour:{" "}
                        {new Date().toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sections d'informations */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            {/* Nom */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Nom
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <span className="text-gray-900">{account.nom}</span>
              </div>
            </div>
            {/* Prénom */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Prénom
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <span className="text-gray-900">{account.prenoms}</span>
              </div>
            </div>
            {/* Date de naissance */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Date de naissance
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 flex items-center">
                <span className="text-gray-900">
                  {new Date(account.date_naissance).toLocaleDateString("fr-FR")}
                </span>
                <Calendar className="h-4 w-4 ml-2 text-gray-400" />
              </div>
            </div>
            {/* Nationalité */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Nationalité
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 flex items-center">
                <img
                  src="/flags/tg.svg"
                  alt="TG"
                  className="w-5 h-4 mr-2"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-gray-900">{account.nationalite}</span>
              </div>
            </div>
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Type
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <span className="text-gray-900">{account.type}</span>
              </div>
            </div>
            {/* Magasin */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Magasin
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <span className="text-gray-900">
                  {account.profile?.nom || "Consultant"}
                </span>
              </div>
            </div>
            {/* Mot de passe */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 flex items-center justify-between">
                <span className="font-mono text-gray-900">
                  {showPassword ? account.mot_de_passe : "••••••••••"}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Section Activités */}
        <div className="bg-white rounded-lg shadow flex-1">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activités</h3>
              <input
                type="date"
                defaultValue="2025-07-10"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">D</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Demande d'appro de ciment
                </h4>
                <p className="text-xs text-gray-500">Activité récente</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">0</span>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bouton Voir le projet associé */}
        <button className="fixed bottom-10 right-10 w-max min-w-48 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center">
          <span>Voir le projet associé</span>
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le compte "${account.nom_utilisateur}" ? Cette action est irréversible.`}
        variant="danger"
        confirmText="Supprimer"
        loading={deleteAccountMutation.isPending}
      />

      {/* Modal de modification (placeholder) */}
      <FormModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        onSubmit={() => {
          // TODO: Implémenter la logique de modification
          editModal.close();
        }}
        title="Modifier le compte"
        submitText="Enregistrer"
      >
        <p className="text-gray-600">
          Formulaire de modification à implémenter...
        </p>
      </FormModal>
    </div>
  );
}
