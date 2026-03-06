import type { ReactNode } from "react";
import { useAccess } from "../../hooks/useAccessPermissions";

interface AccessGuardProps {
  /** Code d'accès requis (ex: "article.create") */
  accessCode?: string;
  /** Liste de codes d'accès - au moins un doit être présent */
  anyOf?: string[];
  /** Liste de codes d'accès - tous doivent être présents */
  allOf?: string[];
  /** Contenu à afficher si l'utilisateur a l'accès */
  children: ReactNode;
  /** Contenu à afficher si l'utilisateur n'a pas l'accès (optionnel) */
  fallback?: ReactNode;
  /** Afficher le fallback pendant le chargement (défaut: true) */
  showFallbackOnLoading?: boolean;
}

/**
 * Composant pour conditionner l'affichage en fonction des accès utilisateur.
 *
 * @example
 * // Accès unique
 * <AccessGuard accessCode="article.create">
 *   <button>Créer un article</button>
 * </AccessGuard>
 *
 * @example
 * // Au moins un des accès
 * <AccessGuard anyOf={["article.update", "article.delete"]}>
 *   <ActionsMenu />
 * </AccessGuard>
 *
 * @example
 * // Tous les accès requis
 * <AccessGuard allOf={["article.view", "article.update"]}>
 *   <EditableView />
 * </AccessGuard>
 */
export function AccessGuard({
  accessCode,
  anyOf,
  allOf,
  children,
  fallback = null,
  showFallbackOnLoading = true,
}: AccessGuardProps) {
  const { hasAccess, hasAnyAccess, hasAllAccess, isLoading } = useAccess();

  // Afficher le fallback pendant le chargement si demandé
  if (isLoading && showFallbackOnLoading) {
    return <>{fallback}</>;
  }

  // Attendre que les permissions soient chargées
  if (isLoading) {
    return null;
  }

  // Vérifier les permissions
  let hasPermission = true;

  if (accessCode) {
    hasPermission = hasAccess(accessCode);
  }

  if (anyOf && anyOf.length > 0 && hasPermission) {
    hasPermission = hasAnyAccess(anyOf);
  }

  if (allOf && allOf.length > 0 && hasPermission) {
    hasPermission = hasAllAccess(allOf);
  }

  // Retourner le contenu approprié
  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Hook pour vérifier si la page/fonctionnalité est accessible
 * Utile pour la navigation conditionnelle ou le rendu de pages entières
 */
export function useCanAccess(accessCode: string): {
  canAccess: boolean;
  isLoading: boolean;
} {
  const { hasAccess, isLoading } = useAccess();

  return {
    canAccess: hasAccess(accessCode),
    isLoading,
  };
}

/**
 * Composant pour afficher un message "Accès refusé" quand l'utilisateur
 * n'a pas les permissions nécessaires pour voir une page
 */
export function AccessDenied({
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Accès refusé
        </h2>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
}

export default AccessGuard;
