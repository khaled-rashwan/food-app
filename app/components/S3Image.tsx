'use client';

import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';

interface S3ImageProps {
  path: string;
  alt: string;
  className?: string;
}

export default function S3Image({ path, alt, className = '' }: S3ImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadImage() {
      try {
        // If it's already a full URL (http/https), use it directly
        if (path.startsWith('http://') || path.startsWith('https://')) {
          setImageUrl(path);
          setLoading(false);
          return;
        }

        // Otherwise, get signed URL from S3
        const result = await getUrl({
          path: path,
        });

        setImageUrl(result.url.toString());
        setLoading(false);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
        setLoading(false);
      }
    }

    if (path) {
      loadImage();
    }
  }, [path]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} />
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
