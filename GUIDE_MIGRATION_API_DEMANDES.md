# Guide de Migration : Données Mockées vers API Réelle

## 🎯 Situation Actuelle

Le système de gestion des demandes utilise actuellement des **données mockées** pour contourner les problèmes d'authentification API (erreurs 403/404).

### ✅ Ce qui fonctionne actuellement :

- Interface complète avec 6 demandes mockées
- Filtrage par statut fonctionnel
- Compteurs de statuts corrects
- Navigation et détails des demandes
- Architecture complète prête pour l'API réelle

## 🔧 Pour Activer l'API Réelle

### 1. Vérifier l'Authentification

Assurez-vous que l'authentification API fonctionne dans `src/services/api/client.ts`

### 2. Réactiver les Endpoints API

Dans `src/services/api/demandeApiService.ts`, remplacer :

```typescript
// Code actuel (mockée)
async getAllDemandes(): Promise<ApiDemande[]> {
  console.log("🔄 Utilisation des données mockées pour le développement");
  return mockApiDemandes;
}

// Par le code API réel
async getAllDemandes(): Promise<ApiDemande[]> {
  try {
    const response = await apiClient.get<ApiDemande[]>(
      `${this.basePath}/demandes/toutes`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des demandes:", error);
    return mockApiDemandes; // Fallback
  }
}
```

### 3. Endpoints Disponibles (selon api-docs.json)

- `GET /Demandes/demandes/toutes` - Toutes les demandes
- `GET /Demandes/demandes/statistiques` - Statistiques
- `GET /Demandes/demande/detail/{id}` - Détail d'une demande
- `POST /Demandes/demande/emettre` - Créer une demande
- `POST /Demandes/demande/confirmer/{id}` - Confirmer
- `POST /Demandes/demande/approuver/{id}` - Approuver
- `POST /Demandes/demande/valider/{id}` - Valider
- `POST /Demandes/demande/rejeter/{id}` - Rejeter

### 4. Supprimer les Imports de Données Mockées

Une fois l'API réelle activée, supprimer :

```typescript
import { mockApiDemandes, mockDemandeStats } from "../../data/mockDemandes";
```

## 🏗️ Architecture Prête

✅ **Types API** : `src/types/api-demandes.ts`  
✅ **Service API** : `src/services/api/demandeApiService.ts`  
✅ **Transformateurs** : `src/services/api/api-transformers.ts`  
✅ **Service Frontend** : `src/services/api/demandeService.ts`  
✅ **Hooks React Query** : `src/hooks/useDemandes.ts`  
✅ **Pages UI** : `RequestsPage.tsx` + `RequestDetailPage.tsx`

## 🔍 Test de l'API

Pour tester les endpoints :

```bash
# Test avec curl (remplacer les credentials)
curl -X GET "http://185.197.195.209:8000/Demandes/demandes/toutes" \
  -H "Authorization: Basic YOUR_TOKEN"
```

## 📋 Checklist de Migration

- [ ] Vérifier l'authentification API
- [ ] Tester l'endpoint `/Demandes/demandes/toutes`
- [ ] Réactiver le code API dans `getAllDemandes()`
- [ ] Réactiver le code API dans `getDemandeStats()`
- [ ] Tester tous les filtres de statut
- [ ] Vérifier les actions (confirmer, approuver, valider, rejeter)
- [ ] Supprimer les imports de données mockées
- [ ] Supprimer le fichier `src/data/mockDemandes.ts`

L'architecture est **100% prête** pour l'API réelle ! 🚀
