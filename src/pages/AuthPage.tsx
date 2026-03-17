import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SimpleAuthFlow } from "../components/auth/SimpleAuthFlow";
import { requestFirebaseNotificationPermission } from "../services/firebase";

export function AuthPage() {
  const navigate = useNavigate();

  // Demander l'autorisation dès que l'utilisateur arrive sur la page de connexion
  useEffect(() => {
    // Retarde légèrement la demande pour ne pas bloquer le rendu initial de la page
    const timer = setTimeout(() => {
      requestFirebaseNotificationPermission().catch(console.error);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleAuthError = (error: string) => {};

  return (
    <SimpleAuthFlow
      onAuthSuccess={handleAuthSuccess}
      onAuthError={handleAuthError}
    />
  );
}
