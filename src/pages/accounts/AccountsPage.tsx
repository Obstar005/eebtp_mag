import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useAccounts,
  useDeleteAccount,
  useToggleAccountStatus,
  useProfiles,
  useModal,
} from "../../hooks";
import { ConfirmationModal } from "../../components/layout";
import type { AccountFilters, AccountType } from "../../types/account";

export function AccountsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<AccountFilters>({});
  const [activeTab, setActiveTab] = useState<"all" | AccountType>("all");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const deleteModal = useModal();
  const limit = 10;

  const { data: accountsData, isLoading } = useAccounts(
    {
      ...filters,
      search: searchTerm || undefined,
      type: activeTab === "all" ? undefined : activeTab,
    },
    page,
    limit
  );

  const { data: profiles } = useProfiles();

  const deleteAccountMutation = useDeleteAccount();
  const toggleStatusMutation = useToggleAccountStatus();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleTabChange = (tab: "all" | AccountType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleDeleteAccount = () => {
    if (selectedAccountId) {
      deleteAccountMutation.mutate(selectedAccountId, {
        onSuccess: () => {
          deleteModal.close();
          setSelectedAccountId(null);
        },
      });
    }
  };

  const handleToggleStatus = (accountId: string) => {
    toggleStatusMutation.mutate(accountId);
  };

  const accounts = accountsData?.data || [];
  const totalPages = accountsData?.totalPages || 1;
  const total = accountsData?.total || 0;

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div
        className={[
          "flex items-center gap-2 px-2 py-1 rounded-full",
          isActive ? "bg-green-100" : "bg-red-100",
        ].join(" ")}
      >
        {" "}
        {isActive ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white bg-green-800"></span>
            <span className="text-xs font-medium text-green-800">
              Actif
            </span>
          </>
        ) : (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white bg-red-800"></span>
            <span className="text-xs font-medium text-red-800">
              Inactif
            </span>
          </>
        )}
      </div>
    );
  };

  const getTypeBadge = (type: AccountType) => {
    return type === "Interne" ? (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        Interne
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
        Consultant
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des comptes
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Liste des comptes</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          onClick={() => {
            window.location.href = "/accounts/add";
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un compte
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou nom d'utilisateur..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter by Profile */}
          <div className="lg:w-64">
            <select
              value={filters.profile_id || ""}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  profile_id: e.target.value || undefined,
                });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tous les profils</option>
              {profiles?.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nom}
                </option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tous ({total})
            </button>
            <button
              onClick={() => handleTabChange("Interne")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "Interne"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Interne
            </button>
            <button
              onClick={() => handleTabChange("Consultant")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "Consultant"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Consultant
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID du compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 ">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.code}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {account.prenoms} {account.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{account.nom_utilisateur}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {account.telephone}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {account.profile.nom}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {getTypeBadge(account.type)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {account.derniere_connexion
                      ? new Date(account.derniere_connexion).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Jamais"}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {getStatusBadge(account.is_active)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/accounts/${account.id}`}
                        className="p-0.5 px-2  text-gray-50 bg-blue-500 hover:bg-blue-600 rounded-md"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={`/accounts/${account.id}/edit`}
                        className="p-0.5 px-2  text-gray-50 bg-green-500 hover:bg-green-600 rounded-md"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {
                          setSelectedAccountId(account.id);
                          deleteModal.open();
                        }}
                        className="p-0.5 px-2  text-gray-50 bg-red-400 hover:bg-red-600 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Affichage de {(page - 1) * limit + 1} à{" "}
              {Math.min(page * limit, total)} sur {total} entrées
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteAccount}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible."
        variant="danger"
        confirmText="Supprimer"
        loading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
