'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Navegación "atrás" que funciona en PWA standalone.
 *
 * En PWA el historial empieza vacío, así que router.back() no hace nada.
 * Este hook trackea cuántas navegaciones ocurrieron dentro de la sesión y,
 * si no hay historial propio, cae al fallback (ruta padre explícita).
 *
 * Uso:
 *   const goBack = useSmartBack('/dashboard');
 *   <button onClick={goBack}>Volver</button>
 */

// Contador global de navegaciones internas a la app.
// Sobrevive re-renders pero se resetea al recargar (correcto para PWA).
let internalNavCount = 0;

export function trackNavigation() {
  internalNavCount++;
}

export function useSmartBack(fallbackPath: string): () => void {
  const router = useRouter();
  const fallback = fallbackPath;

  useEffect(() => {
    // Registramos esta página como parte del historial interno
    trackNavigation();
  }, []);

  return () => {
    if (internalNavCount > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };
}
