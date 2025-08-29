# Composant CustomImage

## Description

Le composant `CustomImage` est un composant d'image personnalisé qui affiche automatiquement une image par défaut lorsque l'image principale ne se charge pas. Il est conçu pour être réutilisable dans toute l'application.

## Fonctionnalités

- ✅ Affichage d'une image par défaut en cas d'erreur de chargement
- ✅ Support du lazy loading
- ✅ Callbacks pour les événements de chargement et d'erreur
- ✅ Support de différents modes d'ajustement d'objet (object-fit)
- ✅ Composants spécialisés pour différents types d'images

## Utilisation

### CustomImage (composant de base)

```tsx
import { CustomImage } from "../../components/ui/CustomImage";

<CustomImage
  src="/path/to/image.jpg"
  alt="Description de l'image"
  className="w-32 h-32"
  width="128px"
  height="128px"
  objectFit="object-cover"
  loading="lazy"
  onLoad={() => console.log("Image chargée")}
  onError={() => console.log("Erreur de chargement")}
/>;
```

### ProjectImage (images de projets)

```tsx
import { ProjectImage } from "../../components/ui/CustomImage";

<ProjectImage
  src={projet.imageUrl}
  alt="Image du projet"
  className="w-full h-48"
/>;
```

### ProductImage (images de produits)

```tsx
import { ProductImage } from "../../components/ui/CustomImage";

<ProductImage
  src={produit.imageUrl}
  alt="Image du produit"
  className="w-24 h-24"
/>;
```

### AvatarImage (avatars d'utilisateurs)

```tsx
import { AvatarImage } from "../../components/ui/CustomImage";

<AvatarImage src={user.avatarUrl} alt="Avatar de l'utilisateur" size="64px" />;
```

## Props du CustomImage

| Prop         | Type            | Défaut              | Description                             |
| ------------ | --------------- | ------------------- | --------------------------------------- | ----------------------------- | ---------------------------- |
| `src`        | `string`        | -                   | URL de l'image à afficher               |
| `alt`        | `string`        | **Requis**          | Texte alternatif pour l'accessibilité   |
| `className`  | `string`        | `''`                | Classes CSS supplémentaires             |
| `defaultSrc` | `string`        | `default-image.png` | Image par défaut en cas d'erreur        |
| `onLoad`     | `function`      | -                   | Callback appelé quand l'image se charge |
| `onError`    | `function`      | -                   | Callback appelé en cas d'erreur         |
| `loading`    | `'lazy'         | 'eager'`            | `'lazy'`                                | Mode de chargement de l'image |
| `objectFit`  | `'object-cover' | 'object-contain'    | ...`                                    | `'object-cover'`              | Mode d'ajustement de l'image |
| `width`      | `string`        | `'auto'`            | Largeur de l'image                      |
| `height`     | `string`        | `'auto'`            | Hauteur de l'image                      |

## Props spécialisés

### AvatarImage

| Prop   | Type     | Défaut   | Description                            |
| ------ | -------- | -------- | -------------------------------------- |
| `size` | `string` | `'40px'` | Taille de l'avatar (largeur = hauteur) |

## Comportement

1. Le composant tente d'abord de charger l'image spécifiée dans `src`
2. Si le chargement échoue, il bascule automatiquement vers l'image par défaut
3. Les callbacks `onLoad` et `onError` sont appelés selon les événements
4. L'état d'erreur est géré automatiquement pour éviter les boucles infinies

## Exemples d'utilisation dans le projet

### Dans AddEditProjectPage.tsx

```tsx
// Remplace ceci :
<img
  src={image || defaultImage}
  alt={`Prévisualisation ${index + 1}`}
  className="w-full h-24 object-cover rounded-lg border border-gray-300"
/>

// Par ceci :
<ProjectImage
  src={image}
  alt={`Prévisualisation ${index + 1}`}
  className="w-full h-24 border border-gray-300"
/>
```

### Dans ProjectDetailsPage.tsx

```tsx
// Pour afficher les images de projet
<ProjectImage
  src={projet?.images?.[0]}
  alt="Image principale du projet"
  className="w-full h-48"
/>
```

## Notes importantes

- Le composant utilise TailwindCSS pour le styling
- L'image par défaut est située dans `src/assets/default-image.png`
- Les dimensions peuvent être contrôlées via les props `width`/`height` ou les classes CSS
- Le composant gère automatiquement les cas d'erreur sans intervention manuelle
