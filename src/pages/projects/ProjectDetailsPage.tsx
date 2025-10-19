import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Edit, Trash2, Upload } from "lucide-react";
import {
  useProjet,
  useDeleteProjet,
  useProjetMagasins,
  useProjetPhotos,
  useAddPhotoToProjet,
  useDeleteProjetPhoto,
  useProjetComptes,
} from "../../hooks/useProjets";
import { useCountries } from "../../hooks/useCountries";
import { useModal } from "../../hooks/useModal";
import { ConfirmationModal } from "../../components/layout/ConfirmationModal";
import { EditMagasinModal } from "../../components/magasins/EditMagasinModal";

export function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projetId = id ? parseInt(id) : 0;

  // Hooks
  const { data: projet, isLoading } = useProjet(projetId);
  const { data: magasins, isLoading: isLoadingMagasins } =
    useProjetMagasins(projetId);
  const { data: photos, isLoading: isLoadingPhotos } =
    useProjetPhotos(projetId);
  const { data: comptes, isLoading: isLoadingComptes } =
    useProjetComptes(projetId);

  // Log pour déboguer la récupération des comptes associés
  console.log("🔍 Projet détails:", projet);
  console.log("🔍 Comptes associés:", comptes);
  console.log("📸 Photos récupérées:", photos);
  console.log("📸 Nombre de photos:", photos?.length || 0);
  console.log("📸 État de chargement des photos:", isLoadingPhotos);
  const { getCountryByAbbreviation, getTogoCountry } = useCountries();
  const deleteProjetMutation = useDeleteProjet();
  const confirmDeleteModal = useModal();
  const [showEditMagasinModal, setShowEditMagasinModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const addPhotoMutation = useAddPhotoToProjet();
  const deletePhotoMutation = useDeleteProjetPhoto();

  // Fonction pour obtenir le pays du projet
  const getProjectCountry = () => {
    if (!projet?.pays) return getTogoCountry(); // Fallback vers Togo

    const country = getCountryByAbbreviation(projet.pays);
    return country || getTogoCountry(); // Fallback vers Togo si pays non trouvé
  };

  const projectCountry = getProjectCountry();

  // Formatage des dates
  const formatDate = (dateValue: string | Date) => {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteProjetMutation.mutateAsync(projetId);
      confirmDeleteModal.close();
      navigate("/projects");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Gestion des photos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    try {
      await addPhotoMutation.mutateAsync({
        projetId,
        photo: selectedFile,
        description: photoDescription,
      });

      // Réinitialiser le formulaire après succès
      setSelectedFile(null);
      setPhotoDescription("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la photo:", error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo?")) return;

    try {
      await deletePhotoMutation.mutateAsync({ photoId, projetId });
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Projet introuvable
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Détails du projet N° PRJT{String(projet.id).padStart(3, "0")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projet.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Colonne gauche - Détails Basiques */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails Basique
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {projet.name || "Nom du projet"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                  {projet.description || "Description du projet"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du début
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {formatDate(projet.date_debut)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {formatDate(projet.date_fin)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {projet.date_debut
                      ? formatDate(projet.date_debut)
                      : "Non définie"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de mise à jour
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {projet.date_fin
                      ? formatDate(projet.date_fin)
                      : "Non définie"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                  {projectCountry?.flag &&
                    (projectCountry.flag.includes("http") ||
                    projectCountry.flag.includes(".svg") ? (
                      <img
                        src={projectCountry.flag}
                        alt={`Drapeau ${projectCountry.name}`}
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                    ) : (
                      <span className="text-lg">{projectCountry.flag}</span>
                    ))}
                  {projectCountry?.name || "Pays non défini"}
                </div>
              </div>
            </div>
          </div>

          {/* Magasins Associés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Magasins Associés
            </h2>

            <div className="space-y-3">
              {isLoadingMagasins ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : magasins && magasins.length > 0 ? (
                <>
                  {magasins.map((magasin) => (
                    <div
                      key={magasin.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {magasin.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {magasin.adresse || "Adresse non définie"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/projects/magasins/${magasin.id}`)
                          }
                          className="bg-green-600 text-white p-1 rounded text-xs"
                          title="Voir le magasin"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setShowEditMagasinModal(true)}
                          className="bg-yellow-500 text-white p-1 rounded text-xs"
                          title="Modifier le magasin"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-max p-3 text-blue-600 hover:bg-blue-50 transition-colors">
                    {magasins.length}{" "}
                    {magasins.length > 1 ? "Magasins" : "Magasin"}
                  </button>
                </>
              ) : (
                <div className="text-center p-4 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-500">
                    Aucun magasin associé à ce projet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Images du projet */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Les images du projet
            </h2>

            {isLoadingPhotos ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.photo}
                      alt={photo.description || "Photo du projet"}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      title="Supprimer cette photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {photo.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                        <p className="text-sm truncate">{photo.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <div className="text-gray-400 mb-2">
                  <Upload className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">Aucune image</p>
              </div>
            )}
          </div>

          {/* Comptes Associés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Comptes Associés
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div>Nom</div>
                <div>Profil</div>
                <div>Actions</div>
              </div>

              {isLoadingComptes ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : comptes && comptes.length > 0 ? (
                comptes.map((compte) => (
                  <div
                    key={compte.userId}
                    className="grid grid-cols-3 gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-700">
                      {compte.userName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {compte.userProfile}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/accounts/${compte.userId}`)}
                        className="bg-green-600 text-white p-1 rounded text-xs"
                        title="Voir le compte"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/accounts/${compte.userId}/edit`)
                        }
                        className="bg-yellow-500 text-white p-1 rounded text-xs"
                        title="Modifier le compte"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 border rounded-md border-gray-200">
                  <p className="text-sm text-gray-500">
                    Aucun compte associé à ce projet.
                  </p>
                </div>
              )}

              {comptes && comptes.length > 0 && (
                <button className="w-max p-3 text-blue-600 hover:bg-blue-50 transition-colors">
                  {comptes.length} {comptes.length > 1 ? "Comptes" : "Compte"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projet.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={confirmDeleteModal.close}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleteProjetMutation.isPending}
      />

      {/* Modal d'édition de magasin */}
      <EditMagasinModal
        isOpen={showEditMagasinModal}
        onClose={() => setShowEditMagasinModal(false)}
        magasinId={1}
      />
    </div>
  );
}
