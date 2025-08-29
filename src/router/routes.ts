// Configuration des routes - version simplifiée pour l'instant
export const routePaths = {
  // Routes publiques
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  // Routes protégées
  dashboard: "/dashboard",
  requests: "/requests",
  accounts: {
    list: "/accounts",
    add: "/accounts/add",
    edit: "/accounts/:id/edit",
    details: "/accounts/:id",
  },
  profiles: {
    list: "/profiles",
    add: "/profiles/add",
  },
  projects: {
    list: "/projects",
    add: "/projects/add",
    details: "/projects/:id",
    edit: "/projects/:id/edit",
  },
  magasins: {
    list: "/magasins",
    add: "/magasins/add",
    edit: "/magasins/:id/edit",
    details: "/magasins/:id",
  },
  inventory: {
    list: "/inventory",
    add: "/inventory/add",
  },
  stores: "/stores",
  reports: "/reports",
  settings: "/settings",
  profile: "/profile",
} as const;

// Types pour la navigation
export type RoutePath = typeof routePaths;
export type RoutePathValue = string;
