import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  ArrowLeft,
  Eye,
  EyeOff,
  Edit2Icon,
} from "lucide-react";
import { useAccount, useDeleteAccount } from "../../hooks";
import { useAuth } from "../../contexts/AuthContext";
import { UserHistoriqueSection } from "../../components/layout/UserHistoriqueSection";

// Fonction utilitaire pour obtenir le chemin du drapeau à partir du code de pays
const getFlagPath = (countryCode: string): string => {
  return `/flags/${countryCode.toLowerCase()}.svg`;
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Non spécifiée";

  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "Date invalide";
  }
};
import { ConfirmationModal, FormModal } from "../../components/layout";
import { useModal } from "../../hooks/useModal";

export function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: account, isLoading, error } = useAccount(id!);
  const { user: currentUser } = useAuth();
  const deleteAccountMutation = useDeleteAccount();

  const deleteModal = useModal();
  const editModal = useModal();

  // Vérifier si c'est le profil de l'utilisateur connecté
  const isOwnProfile = currentUser?.id === account?.id;

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
    } catch (error) {}
  };

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex items-center space-x-4">
        <button
          aria-label="Back"
          onClick={() => navigate("/accounts")}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1
          className="text-xl font-semibold text-gray-900"
          aria-label={`Détails du compte N°${account.code}`}
        >
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
                {account.photo_profil ? (
                  <img
                    src={account.photo_profil}
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
              {/* isOnline badge */}
              {/* Si is_connected est défini, l'utiliser. Sinon, afficher "En ligne" si c'est le profil de l'utilisateur connecté */}
              {(() => {
                const isOnline = account.is_connected ?? isOwnProfile;
                return (
                  <span
                    className={`absolute top-3/7 right-12 p-1 px-4 text-white border-2 border-white rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={isOnline ? "En ligne" : "Hors ligne"}
                  >
                    {isOnline ? "En ligne" : "Hors ligne"}
                  </span>
                );
              })()}
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
                        Créé le: {formatDate(account.date_creation)}
                      </p>
                      {/* updated at */}
                      <p className="text-sm text-gray-500">
                        Mis à jour: {formatDate(account.date_modification)}
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
                  {formatDate(account.date_naissance)}
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
                  src={getFlagPath(account.nationalite)}
                  alt={account.nationalite}
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
            {/* Profil */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                Profil
              </label>
              <div className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <span className="text-gray-900">
                  {account.profile?.nom ||
                    (account.profile_id
                      ? `Profil #${account.profile_id}`
                      : "Non défini")}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Section Historique des activités - visible uniquement si c'est le profil de l'utilisateur */}
        <div className="flex-1">
          <UserHistoriqueSection isOwnProfile={isOwnProfile} />
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
