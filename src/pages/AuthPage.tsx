import { useNavigate } from "react-router-dom";
import { SimpleAuthFlow } from "../components/auth/SimpleAuthFlow";

export function AuthPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleAuthError = (error: string) => {
  };

  return (
    <SimpleAuthFlow
      onAuthSuccess={handleAuthSuccess}
      onAuthError={handleAuthError}
    />
  );
}
