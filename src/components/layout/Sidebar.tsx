import { NavLink } from "react-router-dom";
import { useState } from "react";
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
  Users,
  UserPlus,
  List,
  Briefcase,
  FolderPlus,
  Store,
  Package,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import logoPng from "../../assets/logo_eebtp.png";
import { useAuth } from "../../contexts/AuthContext";

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  {
    name: "Statistiques",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Rapport",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Demande",
    href: "/requests",
    icon: MessageSquare,
  },
  {
    name: "Comptes",
    icon: Users,
    children: [
      {
        name: "Ajouter un compte",
        href: "/accounts/add",
        icon: UserPlus,
      },
      {
        name: "Liste des comptes",
        href: "/accounts",
        icon: List,
      },
    ],
  },
  {
    name: "Profils",
    icon: Briefcase,
    children: [
      {
        name: "Ajouter un profil",
        href: "/profiles/add",
        icon: UserPlus,
      },
      {
        name: "Liste des profils",
        href: "/profiles",
        icon: List,
      },
    ],
  },
  {
    name: "Projets",
    icon: FolderPlus,
    children: [
      {
        name: "Ajouter un projet",
        href: "/projects/add",
        icon: Plus,
      },
      {
        name: "Liste des projets",
        href: "/projects",
        icon: List,
      },
    ],
  },
  {
    name: "Magasins",
    icon: Store,
    children: [
      {
        name: "Ajouter un article",
        href: "/articles/add",
        icon: Plus,
      },
      {
        name: "Liste des articles",
        href: "/articles",
        icon: List,
      },
      {
        name: "Liste des magasins",
        href: "/magasins",
        icon: Store,
      },
      {
        name: "Déclarations",
        href: "/declarations",
        icon: FileText,
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user, logout } = useAuth();

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const paddingLeft = depth === 0 ? "pl-3" : "pl-8";

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${paddingLeft}`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href!}
        className={({ isActive }) =>
          `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${paddingLeft} ${
            isActive
              ? "text-white bg-blue-500"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
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
        w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo et titre */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logoPng} alt="EEBTP" className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-blue-600">EEBTP_MAG</h1>
              <p className="text-xs text-gray-500">Tableau de bord</p>
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

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Pied de page */}
        <div className="absolute bottom-0 px-6 py-4 border-t border-gray-200 w-full">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-8 w-8 bg-blue-600 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || "John"} {user?.lastName || "Doe"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === "admin" ? "Admin" : "DG"}
                </p>
              </div>
            </div>

            {/* Déconnexion */}
            <button
              onClick={logout}
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          {/* Paramètres */}
          <div className="flex items-center justify-between space-x-3 py-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Paramètres</span>
            </div>
            <button
              title="Paramètres"
              aria-label="Paramètres"
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowUpRightFromSquare className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 truncate">
            &copy; {new Date().getFullYear()} EEBTP. Tous droits réservés.
          </p>
        </div>
      </div>
    </>
  );
}
