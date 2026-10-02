"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
  fallbackLabel?: string;
  onError?: ImageProps["onError"];
};

export function ProductImage({
  src,
  fallbackSrc = "/placeholder.svg",
  fallbackLabel = "Imagen no disponible",
  alt,
  onError,
  ...imageProps
}: ProductImageProps) {
  const source = src || fallbackSrc;
  const [imageState, setImageState] = useState({ source, failed: false });

  // Reset the failure before rendering whenever the selected source changes.
  if (imageState.source !== source) {
    setImageState({ source, failed: false });
  }

  const usingFallback = source === fallbackSrc || imageState.failed;
  const displayedSource = usingFallback ? fallbackSrc : source;

  return (
    <Image
      {...imageProps}
      src={displayedSource}
      alt={usingFallback ? fallbackLabel : alt}
      onError={(event) => {
        if (displayedSource !== fallbackSrc) {
          setImageState({ source, failed: true });
        }
        onError?.(event);
      }}
    />
  );
}
