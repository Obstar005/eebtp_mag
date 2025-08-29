import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Pages
import { AuthPage } from "../pages/AuthPage";
import { Dashboard } from "../pages/Dashboard";
import { RequestsPage } from "../pages/RequestsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { AccountsPage } from "../pages/accounts/AccountsPage";
import { AddAccountPage } from "../pages/accounts/AddAccountPage";
import { EditAccountPage } from "../pages/accounts/EditAccountPage";
import { AccountDetailsPage } from "../pages/accounts/AccountDetailsPage";
import { ProfilesPage } from "../pages/ProfilesPage";
import { ProjetsPage } from "../pages/projects/ProjectsPage";
import { AddEditProjectPage } from "../pages/projects/AddEditProjectPage";
import { ProjectDetailsPage } from "../pages/projects/ProjectDetailsPage";
import { MagasinDetailsPage } from "../pages/projects/MagasinDetailsPage";
// Pages des articles
import { ArticlesPage } from "../pages/inventory/ArticlesPage";
import { ArticleDetailsPage } from "../pages/inventory/ArticleDetailsPage";
import { AddArticlePage } from "../pages/inventory/AddArticlePage";
// Pages des magasins
import { MagasinsPage } from "../pages/magasins/MagasinsPage";
import { AddEditMagasinPage } from "../pages/magasins/AddEditMagasinPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "requests",
        element: <RequestsPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      // Routes des comptes
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "accounts/add",
        element: <AddAccountPage />,
      },
      {
        path: "accounts/:id",
        element: <AccountDetailsPage />,
      },
      {
        path: "accounts/:id/edit",
        element: <EditAccountPage />,
      },
      // Routes des profils
      {
        path: "profiles",
        element: <ProfilesPage />,
      },
      // Routes des projets
      {
        path: "projects",
        element: <ProjetsPage />,
      },
      {
        path: "projects/add",
        element: <AddEditProjectPage />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetailsPage />,
      },
      {
        path: "projects/:id/edit",
        element: <AddEditProjectPage />,
      },
      {
        path: "magasins/:id",
        element: <MagasinDetailsPage />,
      },
      // Routes des magasins
      {
        path: "magasins",
        element: <MagasinsPage />,
      },
      {
        path: "magasins/add",
        element: <AddEditMagasinPage />,
      },
      {
        path: "magasins/:id/edit",
        element: <AddEditMagasinPage />,
      },
      // Routes des articles
      {
        path: "articles",
        element: <ArticlesPage />,
      },
      {
        path: "articles/add",
        element: <AddArticlePage />,
      },
      {
        path: "articles/:id",
        element: <ArticleDetailsPage />,
      },
      {
        path: "articles/:id/edit",
        element: <ArticleDetailsPage />,
      },
    ],
  },
]);
