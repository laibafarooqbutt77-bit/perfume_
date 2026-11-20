import { useState, useEffect } from 'react';
import { isIdbMediaRef, resolveIdbMediaUrl } from '../utils/mediaDb';

export function useResolvedMediaUrl(src?: string | null, fallbackSrc = ''): string {
  const isIdb = isIdbMediaRef(src);
  const [resolved, setResolved] = useState<string>(() => {
    if (!src) return fallbackSrc;
    return isIdb ? fallbackSrc : src;
  });

  useEffect(() => {
    let active = true;

    if (!src) {
      setResolved(fallbackSrc);
      return;
    }

    if (!isIdbMediaRef(src)) {
      setResolved(src);
      return;
    }

    resolveIdbMediaUrl(src).then((objectUrl) => {
      if (!active) return;
      setResolved(objectUrl || fallbackSrc);
    });

    return () => {
      active = false;
    };
  }, [src, fallbackSrc]);

  return resolved;
}
