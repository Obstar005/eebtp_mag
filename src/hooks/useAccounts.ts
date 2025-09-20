import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService, profileService } from "../services/api";
import type {
  AccountFilters,
  CreateAccountData,
  UpdateAccountData,
} from "../types/account";

// Clés de cache pour React Query
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters?: AccountFilters, page?: number, limit?: number) =>
    [...accountKeys.lists(), { filters, page, limit }] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
  stats: () => [...accountKeys.all, "stats"] as const,
};

export const profileKeys = {
  all: ["profiles"] as const,
  lists: () => [...profileKeys.all, "list"] as const,
};

// Hooks pour les comptes
export function useAccounts(
  filters?: AccountFilters,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: accountKeys.list(filters, page, limit),
    queryFn: () => accountService.getAccounts(filters, page, limit),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getAccountById(id),
    enabled: !!id,
  });
}

export function useAccountStats() {
  return useQuery({
    queryKey: accountKeys.stats(),
    queryFn: () => accountService.getAccountStats(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountData) => accountService.createAccount(data),
    onSuccess: () => {
      // Invalider le cache des listes et statistiques
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) =>
      accountService.updateAccount(id, data),
    onSuccess: (updatedAccount) => {
      // Invalider et mettre à jour les caches
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      queryClient.setQueryData(
        accountKeys.detail(updatedAccount.id),
        updatedAccount
      );
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
    },
  });
}

export function useToggleAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.toggleAccountStatus(id),
    onSuccess: (updatedAccount) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      queryClient.setQueryData(
        accountKeys.detail(updatedAccount.id),
        updatedAccount
      );
    },
  });
}

// Hooks pour les profils
export function useProfiles() {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: () => profileService.getProfiles(),
  });
}

export function useCreateAccountProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nom: string; description?: string }) =>
      profileService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

export function useUpdateAccountProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { nom: string; description?: string };
    }) => profileService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

export function useDeleteAccountProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}
