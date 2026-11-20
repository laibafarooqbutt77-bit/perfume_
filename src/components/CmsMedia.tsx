import React, { useState, useEffect } from 'react';
import { useResolvedMediaUrl } from '../hooks/useResolvedMediaUrl';

interface CmsImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export const CmsImage: React.FC<CmsImageProps> = ({
  src,
  fallbackSrc = '/images/hero.webp',
  alt = '',
  onError,
  ...rest
}) => {
  const resolved = useResolvedMediaUrl(src, fallbackSrc);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [resolved]);

  const effectiveSrc = errored ? fallbackSrc : resolved || fallbackSrc;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={(e) => {
        if (!errored && effectiveSrc !== fallbackSrc) {
          setErrored(true);
        }
        onError?.(e);
      }}
      {...rest}
    />
  );
};

interface CmsMediaRendererProps {
  src?: string | null;
  mediaType?: 'image' | 'video';
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export const CmsMediaRenderer: React.FC<CmsMediaRendererProps> = ({
  src,
  mediaType = 'image',
  alt = '',
  className = 'w-full h-full object-cover',
  fallbackSrc = '/images/hero.webp',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true
}) => {
  const resolved = useResolvedMediaUrl(src, mediaType === 'image' ? fallbackSrc : '');

  if (mediaType === 'video') {
    if (!resolved) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#141414] text-[#C5B8A5] text-xs p-6">
          Loading video stream...
        </div>
      );
    }
    return (
      <video
        src={resolved}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className={className}
      />
    );
  }

  return <CmsImage src={src} alt={alt} fallbackSrc={fallbackSrc} className={className} />;
};
