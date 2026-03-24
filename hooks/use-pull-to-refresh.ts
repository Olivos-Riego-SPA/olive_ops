'use client';

import { useEffect, useRef, useState } from 'react';

export const PULL_THRESHOLD = 65; // px necesarios para disparar el refresh

/**
 * Detecta el gesto "pull to refresh" en dispositivos táctiles.
 * Solo se activa cuando la página está al tope del scroll (scrollY === 0).
 *
 * @param onRefresh - función async que se llama al soltar el gesto
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY   = useRef(0);
  const active   = useRef(false);
  const triggered = useRef(false);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current   = e.touches[0].clientY;
      active.current   = true;
      triggered.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        active.current = false;
        setPullY(0);
        return;
      }
      setPullY(Math.min(dy, PULL_THRESHOLD * 1.5));
      triggered.current = dy >= PULL_THRESHOLD;
    };

    const onTouchEnd = async () => {
      if (!active.current) return;
      active.current = false;
      setPullY(0);
      if (triggered.current) {
        triggered.current = false;
        setRefreshing(true);
        try { await onRefresh(); } finally { setRefreshing(false); }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [onRefresh]);

  return { pullY, refreshing };
}
