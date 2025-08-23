import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Edit3,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useAccount,
  useDeleteAccount,
  useToggleAccountStatus,
} from "../../hooks";
import { ConfirmationModal, FormModal } from "../../components/layout";
import { useModal } from "../../hooks/useModal";
import { useState } from "react";
import type { AccountType } from "../../types/account";

export function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { data: account, isLoading, error } = useAccount(id!);
  const deleteAccountMutation = useDeleteAccount();
  const toggleStatusMutation = useToggleAccountStatus();

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

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(account.id);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getTypeColor = (type: AccountType) => {
    return type === "Interne"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/accounts")}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails du compte N°{account.code}
            </h1>
            <p className="text-gray-600">Informations détaillées du compte</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
            className={`px-4 py-2 rounded-lg font-medium ${
              account.is_active
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            } ${toggleStatusMutation.isPending ? "opacity-50" : ""}`}
          >
            {toggleStatusMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <>
                {account.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2 inline" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2 inline" />
                    Activer
                  </>
                )}
              </>
            )}
          </button>

          <button
            onClick={editModal.open}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Modifier
          </button>

          <button
            onClick={deleteModal.open}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Card principale avec photo et informations */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center">
            {account.photo_profil ? (
              <img
                src={account.photo_profil}
                alt={`${account.prenoms} ${account.nom}`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-white/80" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-2xl font-bold">{account.nom_utilisateur}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  account.is_active
                )}`}
              >
                {account.is_active ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            <p className="text-xl text-white/90 mb-2">
              {account.prenoms} {account.nom}
            </p>

            <div className="flex items-center space-x-6 text-white/80">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{account.telephone}</span>
              </div>
              {account.derniere_connexion && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Créé le{" "}
                    {new Date(account.date_creation).toLocaleDateString(
                      "fr-FR"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            {account.derniere_connexion && (
              <p className="text-white/80 text-sm">
                Mise à jour le{" "}
                {new Date(account.date_modification).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sections d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">
                  {account.prenoms} {account.nom}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">
                  {new Date(account.date_naissance).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Nationalité</p>
                <p className="font-medium">{account.nationalite}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de compte */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations du compte
          </h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Profil</p>
                <p className="font-medium">{account.profile?.nom}</p>
                {account.profile?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {account.profile.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="h-5 w-5 mr-3 mt-0.5 flex items-center justify-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    getTypeColor(account.type)
                      .replace("text-", "bg-")
                      .split(" ")[0]
                  }`}
                ></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type de compte</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                    account.type
                  )}`}
                >
                  {account.type}
                </span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-current"></div>
                <div className="h-2 w-2 rounded-full bg-current ml-0.5"></div>
                <div className="h-2 w-2 rounded-full bg-current ml-0.5"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mot de passe</p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="font-mono text-sm"
                  >
                    {showPassword ? account.mot_de_passe : "••••••••••"}
                  </button>
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
        </div>
      </div>

      {/* Section Activités */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Activités</h3>
            <input
              type="date"
              defaultValue="2025-07-10"
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Aucune activité récente à afficher
          </p>
        </div>
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
