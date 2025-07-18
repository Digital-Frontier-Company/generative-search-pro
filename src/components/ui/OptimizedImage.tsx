import React from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Renders a picture element that tries to serve a .webp version (same path & file name) first
 * and falls back to the original image. Adds lazy loading + width/height attributes if provided.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, ...imgProps }) => {
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  return (
    <picture>
      {src.match(/\.(png|jpe?g)$/i) && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img src={src} alt={alt} loading="lazy" {...imgProps} />
    </picture>
  );
};

export default OptimizedImage; 