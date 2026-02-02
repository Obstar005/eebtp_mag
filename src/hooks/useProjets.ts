import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import projetService from "../services/api/projetService";
import type {
  ProjetFilters,
  CreateProjetData,
  UpdateProjetData,
  CreateMagasinData,
  ProjetRole,
} from "../types/project";

// Clés de cache pour React Query
export const projetKeys = {
  all: ["projets"] as const,
  lists: () => [...projetKeys.all, "list"] as const,
  list: (filters: ProjetFilters) => [...projetKeys.lists(), filters] as const,
  details: () => [...projetKeys.all, "detail"] as const,
  detail: (id: number) => [...projetKeys.details(), id] as const,
  stats: () => [...projetKeys.all, "stats"] as const,
  magasins: (projetId: number) =>
    [...projetKeys.detail(projetId), "magasins"] as const,
  comptes: (projetId: number) =>
    [...projetKeys.detail(projetId), "comptes"] as const,
  photos: (projetId: number) =>
    [...projetKeys.detail(projetId), "photos"] as const,
  countries: () => ["countries"] as const,
};

// Hook pour récupérer la liste des projets
export function useProjets(filters: ProjetFilters = {}) {
  return useQuery({
    queryKey: projetKeys.list(filters),
    queryFn: () => projetService.getProjets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour récupérer un projet spécifique
export function useProjet(id: number) {
  return useQuery({
    queryKey: projetKeys.detail(id),
    queryFn: () => projetService.getProjetById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id, // Ne pas exécuter si l'ID est falsy
  });
}

// Hook pour créer un projet
export function useCreateProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjetData) => projetService.createProjet(data),
    onSuccess: (newProjet) => {
      // Invalider et refetch les listes de projets
      queryClient.invalidateQueries({ queryKey: projetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projetKeys.stats() });

      // Mettre en cache le nouveau projet
      queryClient.setQueryData(projetKeys.detail(newProjet.id), newProjet);
    },
  });
}

// Hook pour mettre à jour un projet
export function useUpdateProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjetData) => projetService.updateProjet(data),
    onSuccess: (updatedProjet, variables) => {
      // Mettre à jour le cache du projet spécifique
      queryClient.setQueryData(projetKeys.detail(variables.id), updatedProjet);

      // Invalider les listes pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: projetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projetKeys.stats() });
    },
  });
}

// Hook pour supprimer un projet
export function useDeleteProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projetService.deleteProjet(id),
    onSuccess: (_, deletedId) => {
      // Supprimer le projet du cache
      queryClient.removeQueries({ queryKey: projetKeys.detail(deletedId) });

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: projetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projetKeys.stats() });
    },
  });
}

// Hook pour récupérer les statistiques des projets
export function useProjetStats() {
  return useQuery({
    queryKey: projetKeys.stats(),
    queryFn: () => projetService.getProjetStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook pour récupérer les magasins d'un projet
export function useProjetMagasins(projetId: number) {
  return useQuery({
    queryKey: projetKeys.magasins(projetId),
    queryFn: () => projetService.getProjetMagasins(projetId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projetId,
  });
}

// Hook pour ajouter un magasin à un projet
export function useAddMagasinToProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      magasinData,
    }: {
      projetId: number;
      magasinData: CreateMagasinData;
    }) => projetService.addMagasinToProjet(projetId, magasinData),
    onSuccess: (_, variables) => {
      // Invalider les magasins du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.magasins(variables.projetId),
      });

      // Invalider les détails du projet pour mettre à jour le compteur
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour supprimer un magasin d'un projet
export function useRemoveMagasinFromProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      magasinId,
    }: {
      projetId: number;
      magasinId: number;
    }) => projetService.removeMagasinFromProjet(projetId, magasinId),
    onSuccess: (_, variables) => {
      // Invalider les magasins du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.magasins(variables.projetId),
      });

      // Invalider les détails du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

import { countriesService } from "../services/countriesService";

// Hook pour récupérer les pays disponibles
export function useAvailableCountries() {
  return useQuery({
    queryKey: projetKeys.countries(),
    queryFn: () => {
      // Utilise le service pays existant et convertit au format attendu
      const countries = countriesService.getAllCountries();
      return countries.map((country) => ({
        code: country.abbreviation,
        name: country.name,
      }));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - les pays changent rarement
    gcTime: 60 * 60 * 1000, // 1 heure
  });
}

// Hook composé pour récupérer tous les projets (sans pagination) - utile pour les sélecteurs
export function useAllProjets() {
  return useProjets({ limit: 1000 }); // Grande limite pour récupérer tous les projets
}

// Hook pour recherche en temps réel
export function useProjetSearch(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...projetKeys.lists(), "search", searchTerm],
    queryFn: () => projetService.getProjets({ search: searchTerm, limit: 100 }),
    staleTime: 30 * 1000, // 30 secondes pour la recherche
    enabled: enabled && searchTerm.length >= 2, // Chercher seulement si 2+ caractères
  });
}

// Hook pour récupérer les comptes associés à un projet
export function useProjetComptes(projetId: number) {
  return useQuery({
    queryKey: projetKeys.comptes(projetId),
    queryFn: () => projetService.getProjetComptes(projetId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projetId, // Ne pas exécuter si l'ID est falsy
  });
}

// Hook pour ajouter un utilisateur à un projet
export function useAddUserToProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      userId,
      role,
    }: {
      projetId: number;
      userId: number;
      role: ProjetRole;
    }) => {
      // Pour l'instant, utiliser updateProjet pour ajouter l'utilisateur
      // En récupérant d'abord le projet existant
      console.log(
        `👤 Ajout de l'utilisateur ${userId} au projet ${projetId} avec le rôle ${role}`,
      );

      return projetService.getProjetById(projetId).then((projet) => {
        // Récupérer les comptes actuels et ajouter le nouvel utilisateur
        const comptesIds = projet.comptesAssocies?.map((c) => c.userId) || [];
        if (!comptesIds.includes(userId)) {
          comptesIds.push(userId);
        }

        // Mettre à jour le projet avec le nouvel utilisateur
        // Dans une implémentation réelle, nous voudrions aussi associer le rôle
        return projetService.updateProjet({
          id: projetId,
          comptes_associes: comptesIds,
        });
      });
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées aux comptes du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.comptes(variables.projetId),
      });
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour supprimer un utilisateur d'un projet
export function useRemoveUserFromProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      userId,
    }: {
      projetId: number;
      userId: number;
    }) => {
      // Pour l'instant, utiliser updateProjet pour retirer l'utilisateur
      // En récupérant d'abord le projet existant
      return projetService.getProjetById(projetId).then((projet) => {
        // Filtrer les comptes pour exclure l'utilisateur à supprimer
        const comptesIds =
          projet.comptesAssocies
            ?.filter((c) => c.userId !== userId)
            .map((c) => c.userId) || [];

        // Mettre à jour le projet sans l'utilisateur supprimé
        return projetService.updateProjet({
          id: projetId,
          comptes_associes: comptesIds,
        });
      });
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées aux comptes du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.comptes(variables.projetId),
      });
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour mettre à jour le rôle d'un utilisateur dans un projet
export function useUpdateUserRoleInProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      userId,
      newRole,
    }: {
      projetId: number;
      userId: number;
      newRole: ProjetRole;
    }) => {
      console.log(
        `🔄 Mise à jour du rôle de l'utilisateur ${userId} vers ${newRole} dans le projet ${projetId}`,
      );

      // Dans l'implémentation actuelle, nous allons mettre à jour certains champs spécifiques du projet
      // selon le rôle attribué. Dans une API plus complète, cela pourrait être géré différemment.
      return projetService.getProjetById(projetId).then((projet) => {
        const updateData: UpdateProjetData = {
          id: projetId,
        };

        // Mettre à jour le champ approprié selon le rôle
        switch (newRole) {
          case "chef_projet":
            updateData.chef_projet = userId;
            break;
          case "chef_chantier":
            updateData.chef_chantier = userId;
            break;
          case "magasinier":
            updateData.magasinier = userId;
            break;
          // Les autres rôles ne sont pas supportés par l'API actuelle
          case "directeur_travaux":
          case "coordinateur_travaux":
          case "chef_equipe": {
            // Pour ces rôles, simplement s'assurer qu'ils sont dans la liste des comptes associés
            const comptesIds =
              projet.comptesAssocies?.map((c) => c.userId) || [];
            if (!comptesIds.includes(userId)) {
              comptesIds.push(userId);
            }
            updateData.comptes_associes = comptesIds;
            break;
          }
        }

        return projetService.updateProjet(updateData);
      });
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées aux comptes du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.comptes(variables.projetId),
      });
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour récupérer les photos d'un projet
export function useProjetPhotos(projetId: number) {
  return useQuery({
    queryKey: projetKeys.photos(projetId),
    queryFn: () => projetService.getProjetPhotos(projetId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!projetId, // Ne pas exécuter si l'ID est falsy
  });
}

// Hook pour ajouter une photo à un projet
export function useAddPhotoToProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetId,
      photo,
      description,
    }: {
      projetId: number;
      photo: File;
      description?: string;
    }) => projetService.addPhotoToProjet(projetId, photo, description),
    onSuccess: (_, variables) => {
      // Invalider le cache des photos pour ce projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.photos(variables.projetId),
      });
      // Invalider le cache du projet pour refléter les changements
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour supprimer une photo d'un projet
export function useDeleteProjetPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      photoId,
      projetId,
    }: {
      photoId: number;
      projetId: number;
    }) => projetService.deleteProjetPhoto(photoId),
    onSuccess: (_, variables) => {
      // Invalider le cache des photos pour ce projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.photos(variables.projetId),
      });
      // Invalider le cache du projet pour refléter les changements
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}

// Hook pour récupérer les statistiques de quantités d'articles d'un projet
export function useStatsQuantitesArticles(projetId: number | null) {
  return useQuery({
    queryKey: ["stats-quantites-articles", projetId],
    queryFn: () => projetService.getStatsQuantitesArticles(projetId!),
    enabled: !!projetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
