'use client';

import { useEffect, useRef, useState } from 'react';

const EDGE_ZONE   = 32;  // px desde el borde izquierdo para activar el gesto
const THRESHOLD   = 60;  // px horizontales para disparar la navegación
const MAX_PULL    = 120; // px máximos que viaja el indicador

/**
 * Detecta el gesto "swipe desde el borde izquierdo" para navegar atrás.
 *
 * @param onBack - función que se llama al completar el gesto (normalmente router.back())
 */
export function useSwipeBack(onBack: () => void) {
  const [pullX, setPullX]   = useState(0);
  const [going, setGoing]   = useState(false);

  const startX    = useRef(0);
  const startY    = useRef(0);
  const active    = useRef(false);
  const triggered = useRef(false);
  const locked    = useRef<'h' | 'v' | null>(null); // evita interferir con scroll vertical

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t.clientX > EDGE_ZONE) return;
      startX.current    = t.clientX;
      startY.current    = t.clientY;
      active.current    = true;
      triggered.current = false;
      locked.current    = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current) return;
      const t  = e.touches[0];
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);

      // Primera vez que hay movimiento suficiente: decidimos si es horizontal o vertical
      if (!locked.current) {
        if (Math.abs(dx) < 6 && dy < 6) return;
        locked.current = dy > Math.abs(dx) ? 'v' : 'h';
      }

      if (locked.current === 'v' || dx <= 0) {
        active.current = false;
        setPullX(0);
        return;
      }

      setPullX(Math.min(dx, MAX_PULL));
      triggered.current = dx >= THRESHOLD;
    };

    const onTouchEnd = () => {
      if (!active.current) return;
      active.current = false;

      if (triggered.current) {
        triggered.current = false;
        setGoing(true);
        // Pequeño delay para que el usuario vea el indicador completo antes de navegar
        setTimeout(() => {
          onBack();
          setGoing(false);
          setPullX(0);
        }, 120);
      } else {
        setPullX(0);
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
  }, [onBack]);

  return { pullX, going, threshold: THRESHOLD, maxPull: MAX_PULL };
}
