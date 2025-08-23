import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SimpleAuthFlow } from "./components/auth/SimpleAuthFlow";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { ReportsPage } from "./pages/ReportsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { routePaths } from "./router/routes";
import { AccountsPage } from "./pages/accounts/AccountsPage";
import { AddAccountPage } from "./pages/accounts/AddAccountPage";
import { AccountDetailsPage } from "./pages/accounts/AccountDetailsPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { EditAccountPage } from "./pages/accounts/EditAccountPage";

// Créer une instance du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AuthPage() {
  const handleAuthSuccess = () => {
    // La redirection sera gérée automatiquement par ProtectedRoute
    // car l'utilisateur sera maintenant authentifié
  };

  const handleAuthError = (error: string) => {
    console.error("Erreur d'authentification:", error);
    // Ici vous pourriez afficher une notification d'erreur
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleAuthFlow
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route d'authentification */}
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirection par défaut vers le dashboard */}
        <Route index element={<Navigate to={routePaths.dashboard} replace />} />

        {/* Pages principales */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="requests" element={<RequestsPage />} />

        {/* Comptes */}
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/add" element={<AddAccountPage />} />
        <Route path="accounts/:id" element={<AccountDetailsPage />} />
        <Route path="accounts/:id/edit" element={<EditAccountPage />} />

        {/* Autres routes (à implémenter) */}
        <Route path="profiles" element={<ProfilesPage />} />
        <Route
          path="profiles/add"
          element={<div>Ajouter un Profil (à implémenter)</div>}
        />
        <Route
          path="projects"
          element={<div>Page Projets (à implémenter)</div>}
        />
        <Route
          path="projects/add"
          element={<div>Ajouter un Projet (à implémenter)</div>}
        />
        <Route
          path="inventory"
          element={<div>Page Inventaire (à implémenter)</div>}
        />
        <Route
          path="inventory/add"
          element={<div>Ajouter un Article (à implémenter)</div>}
        />
        <Route
          path="stores"
          element={<div>Page Magasins (à implémenter)</div>}
        />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="settings"
          element={<div>Page Paramètres (à implémenter)</div>}
        />
        <Route path="profile" element={<div>Mon Profil (à implémenter)</div>} />
      </Route>

      {/* Route de fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? routePaths.dashboard : "/auth"}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
