'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg'
};

export default function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Create proxied URL for Google images to avoid CORS issues
  const getProxiedImageUrl = (originalSrc: string) => {
    if (originalSrc && originalSrc.includes('googleusercontent.com')) {
      return `/api/proxy-image?url=${encodeURIComponent(originalSrc)}`;
    }
    return originalSrc;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const showFallback = !src || imageError;
  const imageSrc = src ? getProxiedImageUrl(src) : undefined;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {!showFallback && (
        <>
          {imageLoading && (
            <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse flex items-center justify-center`}>
              <div className="text-gray-400 text-xs">...</div>
            </div>
          )}
          <img
            src={imageSrc}
            alt={alt}
            className={`${sizeClasses[size]} rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      )}
      
      {showFallback && (
        <div className={`${sizeClasses[size]} ${className.includes('bg-') ? className : 'bg-gradient-to-r from-indigo-500 to-purple-600'} rounded-full flex items-center justify-center`}>
          <span className="text-white font-semibold">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
}