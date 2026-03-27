import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SimpleAuthFlow } from "./components/auth/SimpleAuthFlow";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { ReportsPage } from "./pages/ReportsPage";
import { RequestsPage } from "./pages/RequestsPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import { routePaths } from "./router/routes";
import { AccountsPage } from "./pages/accounts/AccountsPage";
import { AddAccountPage } from "./pages/accounts/AddAccountPage";
import { AccountDetailsPage } from "./pages/accounts/AccountDetailsPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { ProfileDetailPage } from "./pages/profiles/ProfileDetailPage";
import { ProfileEditPage } from "./pages/profiles/ProfileEditPage";
import { ProfileAddPage } from "./pages/profiles/ProfileAddPage";
import { EditAccountPage } from "./pages/accounts/EditAccountPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { AddEditProjectPage } from "./pages/projects/AddEditProjectPage";
import { ProjectDetailsPage } from "./pages/projects/ProjectDetailsPage";
import { MagasinDetailsPage } from "./pages/projects/MagasinDetailsPage";
import MagasinsPage from "./pages/magasins/MagasinsPage";
import { ArticlesPage } from "./pages/inventory/ArticlesPage";
import { AddArticlePage } from "./pages/inventory/AddArticlePage";
import ArticleDetailsPage from "./pages/inventory/ArticleDetailsPage";
import EditArticlePage from "./pages/inventory/EditArticlePage";
// Pages des déclarations
import { DeclarationsPage } from "./pages/declarations/DeclarationsPage";
import { DeclarationEntreeDetailPage } from "./pages/declarations/DeclarationEntreeDetailPage";
import { DeclarationSortieDetailPage } from "./pages/declarations/DeclarationSortieDetailPage";
import { DeclarationRetourDetailPage } from "./pages/declarations/DeclarationRetourDetailPage";
import { MyProfilePage } from "./pages/MyProfilePage";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleAuthFlow onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

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
          // Rediriger vers dashboard SEULEMENT si authentifié ET configuration complète
          isAuthenticated && user?.hasCompletedSetup ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage />
          )
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
        <Route path="requests/:id" element={<RequestDetailPage />} />

        {/* Comptes */}
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/add" element={<AddAccountPage />} />
        <Route path="accounts/:id" element={<AccountDetailsPage />} />
        <Route path="accounts/:id/edit" element={<EditAccountPage />} />
        <Route path="magasins" element={<MagasinsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/add" element={<AddArticlePage />} />
        <Route path="articles/:id" element={<ArticleDetailsPage />} />
        <Route path="articles/:id/edit" element={<EditArticlePage />} />

        {/* Routes des déclarations */}
        <Route
          path="magasins/:magasinId/declarations"
          element={<DeclarationsPage />}
        />
        <Route
          path="magasins/:magasinId/declarations/:declarationId/detail/livraison"
          element={<DeclarationEntreeDetailPage />}
        />
        <Route
          path="magasins/:magasinId/declarations/:declarationId/detail/sortie"
          element={<DeclarationSortieDetailPage />}
        />
        <Route
          path="magasins/:magasinId/declarations/:declarationId/detail/retour"
          element={<DeclarationRetourDetailPage />}
        />

        <Route path="profiles" element={<ProfilesPage />} />
        <Route path="profiles/add" element={<ProfileAddPage />} />
        <Route path="profiles/:profileId" element={<ProfileDetailPage />} />
        <Route path="profiles/:profileId/edit" element={<ProfileEditPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/add" element={<AddEditProjectPage />} />
        <Route path="projects/:id/edit" element={<AddEditProjectPage />} />
        <Route path="projects/:id/details" element={<ProjectDetailsPage />} />
        <Route path="projects/magasins/:id" element={<MagasinDetailsPage />} />
        <Route
          path="magasins"
          element={<div>Page Magasins (à implémenter)</div>}
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
        <Route path="profile" element={<MyProfilePage />} />
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
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
