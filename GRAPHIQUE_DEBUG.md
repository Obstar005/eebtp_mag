# 📊 Guide de Débogage - Endpoints Graphiques du Dashboard

## 🎯 Objectif

Comprendre comment l'API retourne les données de fluctuation d'entrées/sorties pour pouvoir créer les graphiques correctement.

## 🌐 Endpoints API

### 1. Fluctuation d'Entrées
```
GET /Mouvements/graphe-fluctuations-entrees/{projet_id}/{type_entree}/{periode}/{produit_id}
```

**Paramètres:**
- `projet_id` : ID du projet (nombre)
- `type_entree` : Type d'entrée (string, ex: "entree", "depot")
- `periode` : Période (string: "jour", "semaine", "mois", "total")
- `produit_id` : ID du produit (nombre)

### 2. Fluctuation de Sorties
```
GET /Mouvements/graphe-fluctuations-sorties/{projet_id}/{periode}/{produit_id}
```

**Paramètres:**
- `projet_id` : ID du projet
- `periode` : Période (string)
- `produit_id` : ID du produit

---

## 🚀 Comment Déboguer

### Étape 1 : Trouver des IDs valides

**Pour trouver un project_id valide:**
1. Allez à la page "Projets"
2. Ouvrez la console (F12)
3. Cherchez les logs qui affichent les IDs des projets
4. Notez un ID (ex: 5, 12, etc.)

**Pour trouver un produit_id valide:**
1. Allez à la page "Articles" ou "Produits"
2. Ouvrez la console
3. Cherchez les logs qui affichent les IDs
4. Notez un ID

### Étape 2 : Modifier le Dashboard

Ouvrez `src/pages/Dashboard.tsx` et modifiez les constantes de test:

```typescript
const PROJECT_ID = 5;        // ← Changez 1 par votre ID projet
const TYPE_ENTREE = "entree";
const PERIODE = "jour";
const PRODUIT_ID = 12;       // ← Changez 1 par votre ID produit
```

### Étape 3 : Rafraîchir et Observer

1. Sauvegardez les modifications
2. Rafraîchissez la page (F5)
3. Ouvrez la console (F12)
4. Cherchez les logs "DÉBOGAGE - ENDPOINTS GRAPHIQUE"

---

## 📋 Logs Affichés en Console

### Succès ✅

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║       🔍 DÉBOGAGE - ENDPOINTS GRAPHIQUE DU DASHBOARD          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📌 IDS DE TEST UTILISÉS:
   project_id: 5
   type_entree: entree
   periode: jour
   produit_id: 12

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 TEST 1: Fluctuation d'entrées
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 MouvementsApiService.getFluctuationEntree()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 PARAMÈTRES D'APPEL:
   projet_id: 5
   type_entree: entree
   periode: jour
   produit_id: 12

🌐 ENDPOINT APPELÉ:
   /Mouvements/graphe-fluctuations-entrees/5/entree/jour/12

✅ RÉPONSE REÇUE AVEC SUCCÈS
   Status HTTP: 200
   Status Text: OK

📋 ANALYSE DE LA STRUCTURE:
   Type de response.data: object
   Est un tableau? true
   Longueur: 10

📦 STRUCTURE DU PREMIER ÉLÉMENT:
   Type: object
   Clés: date, valeur, type, ...
   Contenu:
   {
     "date": "2025-11-14",
     "valeur": 150,
     "type": "entree",
     ...
   }

✨ RÉSUMÉ DE LA STRUCTURE RETOURNÉE:
   Type: Tableau
   Éléments: 10
   └─ Tableau avec 10 éléments (voir détails ci-dessus)
```

### Erreur 404 ❌

```
❌ ERREUR LORS DE L'APPEL API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Status HTTP: 404
   Status Text: Not Found
   Méthode: GET
   URL: http://api.example.com/Mouvements/graphe-fluctuations-entrees/1/entree/jour/1

   Réponse d'erreur:
   {
     "detail": "Not found."
   }
```

**Solution:** Les IDs utilisés n'existent pas. Cherchez des IDs valides!

---

## 📊 Structure de Données Attendue

Basé sur la documentation API, la réponse sera probablement:

### Format 1 : Tableau d'objets
```typescript
[
  {
    date: "2025-11-14",
    valeur: 150,
    type: "entree",
    // ... autres champs
  },
  {
    date: "2025-11-13",
    valeur: 200,
    type: "entree",
  },
  // ... plus d'éléments
]
```

### Format 2 : Objet avec labels et datasets
```typescript
{
  labels: ["14/11", "13/11", "12/11", ...],
  datasets: [
    {
      label: "Entrées",
      data: [150, 200, 180, ...],
      // ... options du graphique
    }
  ]
}
```

### Format 3 : Objet avec données agrégées
```typescript
{
  total: 5000,
  moyenne: 500,
  periodes: [
    { date: "2025-11-14", valeur: 150 },
    { date: "2025-11-13", valeur: 200 },
    // ...
  ]
}
```

---

## 🔍 Analyse des Logs

Quand vous voyez les logs, cherchez:

1. **Type de la réponse**
   - Tableau? → Utilisez `.map()` pour itérer
   - Objet? → Accessibilité par clés directes

2. **Clés principales**
   - Quels noms de champs? (date, valeur, type, etc.)
   - Quels types? (string, number, boolean, etc.)

3. **Nombre d'éléments**
   - Si c'est un tableau, combien d'éléments?
   - Représentent-ils des jours? des semaines?

4. **Format des dates**
   - "2025-11-14" (ISO)
   - "14-11-2025" (EU)
   - "11/14/2025" (US)
   - Timestamp UNIX?

---

## 💡 Prochaines Étapes

Une fois la structure confirmée:

1. **Créer les interfaces TypeScript** pour typer les données
2. **Mettre à jour le service** avec les bons types
3. **Créer un hook React Query** pour récupérer et mettre en cache
4. **Créer les composants graphiques** (Recharts, Chart.js, etc.)
5. **Intégrer au Dashboard** en remplaçant les graphiques mockés

---

## 🛠️ Utilitaire de Test

Pour tester manuellement dans la console du navigateur:

```javascript
// 1. Importer le service
import { mouvementsApiService } from "./services/api";

// 2. Appeler l'endpoint avec des IDs valides
mouvementsApiService.getFluctuationEntree(5, "entree", "jour", 12)
  .then(data => {
    console.log("Succès!", data);
    console.log("Type:", Array.isArray(data) ? "Tableau" : "Objet");
    if (Array.isArray(data)) {
      console.log("Premier élément:", data[0]);
    }
  })
  .catch(err => console.error("Erreur:", err));

// 3. Observer les logs détaillés dans la console
```

---

## 📝 Template pour Créer les Types

Une fois que vous connaissez la structure, créez `src/types/mouvements.ts`:

```typescript
// À adapter selon votre structure
export interface FluctuationData {
  date: string;
  valeur: number;
  type?: string;
  // ... autres champs identifiés dans les logs
}

export type FluctuationEntreeResponse = FluctuationData[];
// ou
// export type FluctuationEntreeResponse = { labels: string[]; datasets: any[] };
```

---

## ⚠️ Problèmes Courants

| Problème | Cause | Solution |
|----------|-------|----------|
| 404 Not Found | IDs invalides | Chercher des IDs valides dans l'app |
| 500 Server Error | Erreur serveur | Vérifier l'API est accessible |
| Données nulles | Pas de mouvements pour cette période | Essayer une période plus longue (mois, total) |
| Structure différente | API retourne format inconnu | Examiner les logs en détail |

