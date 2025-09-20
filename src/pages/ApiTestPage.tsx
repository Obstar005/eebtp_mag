import React, { useState } from "react";
import { authApiService } from "../services/api/authApiService";

interface ApiError {
  message: string;
  response?: {
    status: number;
    data: unknown;
  };
}

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [phone, setPhone] = useState("22890000000"); // Numéro de test
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const authService = authApiService;

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testCheckUserExists = async () => {
    setLoading(true);
    try {
      addResult(`🔍 Test checkUserExists avec téléphone: ${phone}`);
      const result = await authService.checkUserExists(phone);
      addResult(`✅ Résultat: ${JSON.stringify(result)}`);
    } catch (error: unknown) {
      const err = error as ApiError;
      addResult(`❌ Erreur: ${err.message}`);
      if (err.response) {
        addResult(
          `📊 Status: ${err.response.status}, Data: ${JSON.stringify(
            err.response.data
          )}`
        );
      }
    }
    setLoading(false);
  };

  const testLoginByPhone = async () => {
    if (!password) {
      addResult("❌ Veuillez saisir un mot de passe");
      return;
    }

    setLoading(true);
    try {
      addResult(`🔐 Test loginByPhone avec: ${phone}`);
      const result = await authService.loginByPhone({ phone, password });
      addResult(`✅ Connexion réussie: ${JSON.stringify(result)}`);
    } catch (error: unknown) {
      const err = error as ApiError;
      addResult(`❌ Erreur de connexion: ${err.message}`);
      if (err.response) {
        addResult(
          `📊 Status: ${err.response.status}, Data: ${JSON.stringify(
            err.response.data
          )}`
        );
      }
    }
    setLoading(false);
  };

  const testGetUserInfo = async () => {
    setLoading(true);
    try {
      addResult(`ℹ️ Test getUserInfo (nécessite JWT token)`);
      const result = await authService.getUserInfo();
      addResult(`✅ Infos utilisateur: ${JSON.stringify(result)}`);
    } catch (error: unknown) {
      const err = error as ApiError;
      addResult(`❌ Erreur getUserInfo: ${err.message}`);
      if (err.response) {
        addResult(
          `📊 Status: ${err.response.status}, Data: ${JSON.stringify(
            err.response.data
          )}`
        );
      }
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🧪 Test API EEBTP - Authentification</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>Configuration de test</h3>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Téléphone:
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Mot de passe:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Tests disponibles</h3>
        <button
          onClick={testCheckUserExists}
          disabled={loading}
          style={{
            margin: "5px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
          }}
        >
          Test Check User Exists
        </button>
        <button
          onClick={testLoginByPhone}
          disabled={loading || !password}
          style={{
            margin: "5px",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
          }}
        >
          Test Login By Phone
        </button>
        <button
          onClick={testGetUserInfo}
          disabled={loading}
          style={{
            margin: "5px",
            padding: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "3px",
          }}
        >
          Test Get User Info (JWT required)
        </button>
        <button
          onClick={clearResults}
          style={{
            margin: "5px",
            padding: "10px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "3px",
          }}
        >
          Effacer les résultats
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h3>Résultats des tests</h3>
        {loading && <p style={{ color: "#007bff" }}>⏳ Test en cours...</p>}
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {testResults.map((result, index) => (
            <div
              key={index}
              style={{
                marginBottom: "5px",
                paddingBottom: "5px",
                borderBottom: "1px solid #eee",
              }}
            >
              {result}
            </div>
          ))}
          {testResults.length === 0 && (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>
              Aucun test exécuté pour le moment
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f0f8ff",
          border: "1px solid #b6d7ff",
          borderRadius: "5px",
        }}
      >
        <h4>ℹ️ Informations</h4>
        <p>
          <strong>URL API:</strong> http://185.197.195.209:8000
        </p>
        <p>
          <strong>Authentification:</strong> Basic Auth (configuré
          automatiquement)
        </p>
        <p>
          <strong>Note:</strong> Les vrais credentials doivent être configurés
          dans .env.development
        </p>
      </div>
    </div>
  );
};

export default ApiTestPage;
