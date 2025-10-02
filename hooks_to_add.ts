// Hook pour récupérer les photos d'un projet
export function useProjetPhotos(projetId: number) {
  return useQuery({
    queryKey: projetKeys.photos(projetId),
    queryFn: () => projetService.getProjetPhotos(projetId),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // Invalider le cache des photos du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.photos(variables.projetId),
      });

      // Invalider les détails du projet car ils peuvent inclure les photos
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
      projetId,
      photoId,
    }: {
      projetId: number;
      photoId: number;
    }) => projetService.deleteProjetPhoto(photoId),
    onSuccess: (_, variables) => {
      // Invalider le cache des photos du projet
      queryClient.invalidateQueries({
        queryKey: projetKeys.photos(variables.projetId),
      });

      // Invalider les détails du projet car ils peuvent inclure les photos
      queryClient.invalidateQueries({
        queryKey: projetKeys.detail(variables.projetId),
      });
    },
  });
}
