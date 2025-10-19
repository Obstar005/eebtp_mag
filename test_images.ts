// Script de test pour vérifier le fonctionnement des images de projets

// Test 1: Vérifier l'API endpoint pour récupérer les photos d'un projet
console.log("🧪 Test 1: Vérification de l'endpoint API pour les photos");

// URL de test - remplacez {projetId} par un ID de projet existant
const testProjectId = 1;
const photosEndpoint = `/api/Projets/projet-photos-list/${testProjectId}`;
console.log("📋 Endpoint de récupération des photos:", photosEndpoint);

// Test 2: Vérifier l'endpoint pour ajouter une photo
const addPhotoEndpoint = `/api/Projets/projet-photo-create/${testProjectId}`;
console.log("📋 Endpoint d'ajout de photo:", addPhotoEndpoint);

// Test 3: Format attendu pour l'ajout de photo
console.log("📋 Format FormData attendu pour l'ajout:");
console.log("- photo: File");
console.log("- projet: number (ID du projet)");
console.log("- description: string (optionnel)");

// Test 4: Vérifier la structure de réponse attendue
console.log("📋 Structure de réponse attendue pour getProjetPhotos:");
console.log("Array<{ id: number, photo: string, description?: string }>");

export {};
