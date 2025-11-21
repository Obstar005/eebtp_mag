import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas authentifié du tout, rediriger vers /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Si l'utilisateur n'a pas complété sa configuration, afficher le formulaire de changement de mot de passe
  // MAIS rester sur la page actuelle et afficher un message ou rediriger UNIQUEMENT vers /auth
  if (user && !user.hasCompletedSetup) {
    // Si on est déjà sur /auth, laisser passer (SimpleAuthFlow va gérer)
    if (location.pathname === "/auth") {
      return <>{children}</>;
    }

    // Sinon rediriger vers /auth pour compléter la configuration
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
