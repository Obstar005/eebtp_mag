import { User, Search, Settings, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { useState, useRef, useEffect } from "react";
import { formatRole } from "../../utils/formatUtils";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <NotificationDropdown />
            {/* Bouton mode sombre/clair */}
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Changer le thème"
              aria-label="Changer le thème"
            >
              <Settings className="h-5 w-5" />
            </button>
            {/* Profil utilisateur */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 ml-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center h-8 w-8 bg-gray-900 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user?.firstName || "-"} {user?.lastName || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRole(user?.profil)}
                  </p>
                </div>
              </button>

              {/* Dropdown profil */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Informations utilisateur */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email || user?.phone}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatRole(user?.profil)}
                    </div>
                  </div>

                  {/* Détails du compte */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Informations du compte
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Téléphone</span>
                        <span className="text-gray-900 font-medium">
                          {user?.phone}
                        </span>
                      </div>
                      {user?.email && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Email</span>
                          <span className="text-gray-900 font-medium">
                            {user?.email}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Statut</span>
                        <span
                          className={`font-medium ${
                            user?.isActive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {user?.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-2 py-2">
                    <button
                      onClick={async () => {
                        setShowProfileDropdown(false);
                        try {
                          await logout();
                        } catch (error) {
                          // Erreur gérée dans le contexte
                        }
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
