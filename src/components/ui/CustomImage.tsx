import { useState, useRef, useEffect } from "react";
import defaultImage from "../../assets/default-image.png";

interface CustomImageProps {
  src?: string;
  alt: string;
  className?: string;
  defaultSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
  objectFit?:
    | "object-cover"
    | "object-contain"
    | "object-fill"
    | "object-scale-down"
    | "object-none";
  width?: string;
  height?: string;
}

export function CustomImage({
  src,
  alt,
  className = "",
  defaultSrc = defaultImage,
  onLoad,
  onError,
  loading = "lazy",
  objectFit = "object-cover",
  width = "auto",
  height = "auto",
  ...props
}: CustomImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || defaultSrc);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Réinitialiser l'état quand src change
  useEffect(() => {
    if (src && src !== currentSrc && !hasError) {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [src, currentSrc, hasError]);

  const handleError = () => {
    if (!hasError && currentSrc !== defaultSrc) {
      setHasError(true);
      setCurrentSrc(defaultSrc);
      onError?.();
    }
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // Construire les classes CSS pour les dimensions
  const sizeClasses = [];
  if (width !== "auto") sizeClasses.push(`w-[${width}]`);
  if (height !== "auto") sizeClasses.push(`h-[${height}]`);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${objectFit} ${sizeClasses.join(" ")} ${className}`}
      onError={handleError}
      onLoad={handleLoad}
      loading={loading}
      {...props}
    />
  );
}

// Composant spécialisé pour les avatars
export function AvatarImage({
  src,
  alt,
  size = "40px",
  className = "",
  ...props
}: Omit<CustomImageProps, "width" | "height" | "objectFit"> & {
  size?: string;
}) {
  return (
    <CustomImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      objectFit="object-cover"
      className={`rounded-full ${className}`}
      {...props}
    />
  );
}

// Composant spécialisé pour les images de projet
export function ProjectImage({
  src,
  alt,
  className = "",
  ...props
}: CustomImageProps) {
  return (
    <CustomImage
      src={src}
      alt={alt}
      objectFit="object-cover"
      className={`rounded-lg ${className}`}
      {...props}
    />
  );
}

// Composant spécialisé pour les images de produits
export function ProductImage({
  src,
  alt,
  className = "",
  ...props
}: CustomImageProps) {
  return (
    <CustomImage
      src={src}
      alt={alt}
      objectFit="object-cover"
      className={`rounded-md border border-gray-200 ${className}`}
      {...props}
    />
  );
}
