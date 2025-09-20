// Test simple de connectivité avec l'API EEBTP

async function testApiConnection() {
  console.log("🔍 Test de connectivité avec l'API EEBTP...");

  try {
    // Test 1: Vérifier si l'API répond
    console.log("📡 Test de base API...");
    const response = await fetch("http://185.197.195.209:8000/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API accessible - Status:", response.status);
    console.log("Response:", await response.text());

    // Test 2: Essayer un endpoint avec auth basic
    console.log("🔐 Test d'endpoint avec auth...");
    const testPhone = "22890000000"; // Numéro de test

    // Créer les credentials Basic Auth (il faut des vrais credentials)
    const username = "test_user"; // À remplacer par de vrais credentials
    const password = "test_password"; // À remplacer par de vrais credentials
    const authHeader =
      "Basic " + Buffer.from(username + ":" + password).toString("base64");

    const authResponse = await fetch(
      "http://185.197.195.209:8000/Users/authentication/check-user-exists/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ telephone: testPhone }),
      }
    );

    console.log("Status auth endpoint:", authResponse.status);
    const authResult = await authResponse.text();
    console.log("Response auth:", authResult);
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  }
}

// Exécuter le test
testApiConnection();
