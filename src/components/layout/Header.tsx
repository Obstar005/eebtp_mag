import { Bell, User, Search, Settings, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Fonction pour obtenir le titre de la page actuelle
  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("/accounts")) {
      return "Comptes";
    } else if (path.includes("/projects")) {
      return "Projets";
    } else if (path.includes("/magasins")) {
      return "Magasins";
    } else if (path.includes("/declarations")) {
      return "Déclarations";
    } else if (path.includes("/articles")) {
      return "Articles";
    } else if (path.includes("/reports")) {
      return "Rapports";
    } else if (path.includes("/requests")) {
      return "Demandes";
    } else if (path.includes("/profiles")) {
      return "Profils";
    } else if (path.includes("/dashboard") || path === "/") {
      return "Tableau de bord";
    }

    return "Tableau de bord";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Menu burger et titre */}
        <div className="flex items-center space-x-4">
          {/* Bouton menu mobile */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center justify-end gap-4 flex-1">
          {/* Barre de recherche centrée */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
          </div>
          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2">
            {/* Barre de recherche mobile */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rechercher"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>
            {/* Notifications */}
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            {/* Bouton mode sombre/clair */}
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Changer le thème"
              aria-label="Changer le thème"
            >
              <Settings className="h-5 w-5" />
            </button>
            {/* Profil utilisateur */}
            <div className="flex items-center space-x-3 ml-3">
              <div className="flex items-center justify-center h-8 w-8 bg-gray-900 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {user?.firstName || "John"} {user?.lastName || "Doe"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === "admin" ? "Admin" : "DG"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
