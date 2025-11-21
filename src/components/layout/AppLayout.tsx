import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserInfoErrorModal } from "./UserInfoErrorModal";
import { ToastContainer } from "react-toast";
import { useAuth } from "../../contexts/AuthContext";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, refreshUserInfo, userInfoError, clearUserInfoError, logout } =
    useAuth();
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const navigate = useNavigate();

  // Récupérer les infos utilisateur une fois au chargement si connecté
  useEffect(() => {
    const loadUserInfo = async () => {
      // Ne charger que si on a un utilisateur connecté et pas déjà en cours de chargement
      if (user && !isLoadingUserInfo) {
        setIsLoadingUserInfo(true);
        try {
          await refreshUserInfo();
        } catch (error) {
          // L'erreur est gérée dans le contexte et affichée via le modal
        } finally {
          setIsLoadingUserInfo(false);
        }
      }
    };

    loadUserInfo();
  }, []); // Exécuter une seule fois au montage

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleRetryUserInfo = async () => {
    clearUserInfoError();
    setIsLoadingUserInfo(true);
    try {
      await refreshUserInfo();
    } catch (error) {
      // L'erreur sera à nouveau stockée et affichée
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const handleLogoutFromError = async () => {
    clearUserInfoError();
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Modal d'erreur de récupération des infos utilisateur */}
      <UserInfoErrorModal
        isOpen={!!userInfoError}
        onRetry={handleRetryUserInfo}
        onLogout={handleLogoutFromError}
        errorMessage={userInfoError || undefined}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
