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
    ],
  },
]);
