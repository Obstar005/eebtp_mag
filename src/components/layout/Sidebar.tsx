import { NavLink } from "react-router-dom";
import {
  ArrowUpRightFromSquare,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart3,
  FileText,
  MessageSquare,
  UserPlus,
  List,
  Store,
  Plus,
  User,
  LogOut,
} from "lucide-react";
import logoPng from "../../assets/logo_eebtp.png";
import { useAuth } from "../../contexts/AuthContext";
import { useAccess } from "../../hooks/useAccessPermissions";
import { formatRole } from "../../utils/formatUtils";

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
  permissionKey?: string; // Clé de permission pour filtrer l'affichage
}

// Structure des sections avec titre et items
interface NavigationSection {
  title?: string;
  items: MenuItem[];
  sectionPermissionKey?: string; // Clé de permission pour toute la section
}

// Navigation de base - sera filtrée par les permissions
const getNavigation = (): NavigationSection[] => [
  // Section principale - Statistiques
  {
    title: "Statistiques",
    items: [
      {
        name: "Tableau de bord",
        href: "/dashboard",
        icon: BarChart3,
        permissionKey: "statistique.canView",
      },
      {
        name: "Rapport",
        href: "/reports",
        icon: FileText,
        permissionKey: "rapport.canCreate",
      },
    ],
  },
  // Section Profils
  {
    title: "Profils",
    items: [
      {
        name: "Ajouter un profil",
        href: "/profiles/add",
        icon: UserPlus,
        permissionKey: "profil.canCreate",
      },
      {
        name: "Liste des profils",
        href: "/profiles",
        icon: List,
        permissionKey: "profil.canView",
      },
    ],
  },
  // Section Comptes
  {
    title: "Comptes",
    items: [
      {
        name: "Ajouter un compte",
        href: "/accounts/add",
        icon: UserPlus,
        permissionKey: "userAccess.canCreate",
      },
      {
        name: "Liste des comptes",
        href: "/accounts",
        icon: List,
        permissionKey: "userAccess.canView",
      },
    ],
  },
  // Section Projets
  {
    title: "Projets",
    items: [
      {
        name: "Ajouter un projet",
        href: "/projects/add",
        icon: Plus,
        permissionKey: "projet.canCreate",
      },
      {
        name: "Liste des projets",
        href: "/projects",
        icon: List,
        permissionKey: "projet.canView",
      },
    ],
  },
  // Section Magasins
  {
    title: "Magasins",
    items: [
      {
        name: "Ajouter un article",
        href: "/articles/add",
        icon: Plus,
        permissionKey: "article.canCreate",
      },
      {
        name: "Liste des articles",
        href: "/articles",
        icon: List,
        permissionKey: "article.canView",
      },
      {
        name: "Liste des magasins",
        href: "/magasins",
        icon: Store,
        permissionKey: "magasin.canView",
      },
    ],
  },
  // Section Demandes
  {
    title: "Demandes",
    items: [
      {
        name: "Liste des demandes",
        href: "/requests",
        icon: MessageSquare,
        permissionKey: "demande.canView",
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const accessPerms = useAccess();

  // Fonction pour vérifier si l'utilisateur a la permission
  const hasPermission = (permissionKey?: string): boolean => {
    if (!permissionKey) return true; // Pas de permission requise = visible

    const [module, permission] = permissionKey.split(".");
    const modulePerms = accessPerms[module as keyof typeof accessPerms];

    if (typeof modulePerms === "object" && modulePerms !== null) {
      return (modulePerms as Record<string, boolean>)[permission] ?? false;
    }

    return false;
  };

  // Filtrer les items de navigation selon les permissions
  const getFilteredNavigation = (): NavigationSection[] => {
    const navigation = getNavigation();

    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          hasPermission(item.permissionKey),
        ),
      }))
      .filter((section) => section.items.length > 0); // Masquer les sections vides
  };

  const filteredNavigation = getFilteredNavigation();

  const renderMenuItem = (item: MenuItem) => {
    return (
      <NavLink
        key={item.name}
        to={item.href!}
        className={({ isActive }) =>
          `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive
              ? "text-white bg-blue-600"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              className={`mr-3 h-4 w-4 flex-shrink-0 ${
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            {item.name}
          </>
        )}
      </NavLink>
    );
  };

  const renderSection = (section: NavigationSection, index: number) => {
    return (
      <div key={index} className={index > 0 ? "mt-6" : ""}>
        {section.title && (
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {section.title}
          </h3>
        )}
        <div className="space-y-1">
          {section.items.map((item) => renderMenuItem(item))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-white shadow-sm border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col h-screen
      `}
      >
        {/* Logo et titre */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div className="flex items-center">
            <img src={logoPng} alt="EEBTP" className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-blue-600">EEBTP_MAG</h1>
              <p className="text-xs text-gray-500">Gestionnaire</p>
            </div>
          </div>

          {/* Bouton fermer mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Zone scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {filteredNavigation.map((section, index) =>
              renderSection(section, index),
            )}
          </div>
        </nav>

        {/* Pied de page - Fixe en bas */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between space-x-3 mb-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex items-center justify-center h-8 w-8 bg-gray-900 rounded-full flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate capitalize">
                  {user?.firstName || "-"} {user?.lastName || "-"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {formatRole(user?.profil)}
                </p>
              </div>
            </div>

            {/* Déconnexion */}
            <button
              onClick={async () => {
                try {
                  await logout();
                } catch (error) {}
              }}
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Paramètres */}
          <div className="flex items-center justify-between space-x-3 mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Settings className="h-4 w-4 flex-shrink-0 text-gray-600" />
              <span className="text-sm text-gray-700 truncate">Paramètres</span>
            </div>
            <button
              title="Paramètres"
              aria-label="Paramètres"
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowUpRightFromSquare className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-gray-500 truncate">
            &copy; {new Date().getFullYear()} EEBTP. Tous droits réservés.
          </p>
        </div>
      </div>
    </>
  );
}
