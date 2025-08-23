# Documentation des Modals

## Vue d'ensemble

Le système de modals de l'application est composé de plusieurs composants réutilisables pour gérer les différents types de modals.

## Composants disponibles

### 1. Modal (Composant de base)

Le composant `Modal` est le composant de base qui peut être utilisé pour créer n'importe quel type de modal.

```tsx
import { Modal, ModalButton } from "@/components/layout";
import { useModal } from "@/hooks";

function MyComponent() {
  const modal = useModal();

  return (
    <>
      <button onClick={modal.open}>Ouvrir le modal</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Mon Modal"
        size="md"
        footer={
          <>
            <ModalButton variant="secondary" onClick={modal.close}>
              Annuler
            </ModalButton>
            <ModalButton variant="primary" onClick={() => console.log("OK")}>
              OK
            </ModalButton>
          </>
        }
      >
        <p>Contenu du modal</p>
      </Modal>
    </>
  );
}
```

### 2. ConfirmationModal

Modal pré-configuré pour les confirmations d'actions.

```tsx
import { ConfirmationModal } from "@/components/layout";
import { useModal } from "@/hooks";

function DeleteButton() {
  const confirmModal = useModal();

  const handleDelete = () => {
    // Logique de suppression
    console.log("Élément supprimé");
  };

  return (
    <>
      <button onClick={confirmModal.open}>Supprimer</button>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet élément ?"
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
}
```

### 3. FormModal

Modal optimisé pour les formulaires.

```tsx
import { FormModal } from "@/components/layout";
import { useModal } from "@/hooks";
import { useState } from "react";

function AddUserButton() {
  const formModal = useModal();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Logique de soumission
      await saveUser({ name });
      formModal.close();
      setName("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={formModal.open}>Ajouter un utilisateur</button>

      <FormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSubmit={handleSubmit}
        title="Ajouter un utilisateur"
        loading={loading}
        submitText="Créer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}
```

## Props disponibles

### Modal

- `isOpen: boolean` - État d'ouverture du modal
- `onClose: () => void` - Fonction de fermeture
- `title?: string` - Titre du modal
- `size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"` - Taille du modal
- `showCloseButton?: boolean` - Afficher le bouton de fermeture (défaut: true)
- `closeOnOverlayClick?: boolean` - Fermer en cliquant sur l'overlay (défaut: true)
- `closeOnEscape?: boolean` - Fermer avec la touche Escape (défaut: true)
- `footer?: ReactNode` - Contenu du footer
- `className?: string` - Classes CSS supplémentaires

### ModalButton

- `variant?: "primary" | "secondary" | "danger" | "success"` - Style du bouton
- `loading?: boolean` - État de chargement
- `disabled?: boolean` - État désactivé
- `type?: "button" | "submit" | "reset"` - Type du bouton

### useModal Hook

```tsx
const modal = useModal(false); // État initial (optionnel)

// Méthodes disponibles:
modal.isOpen; // boolean - État actuel
modal.open(); // Ouvrir le modal
modal.close(); // Fermer le modal
modal.toggle(); // Basculer l'état
```

## Fonctionnalités

- ✅ Fermeture avec Escape
- ✅ Fermeture en cliquant sur l'overlay
- ✅ Prévention du défilement du body
- ✅ Animations d'entrée/sortie
- ✅ Gestion du focus et accessibilité
- ✅ Différentes tailles de modal
- ✅ Footer personnalisable
- ✅ Boutons pré-stylés
- ✅ État de chargement
- ✅ Hook pour la gestion d'état
