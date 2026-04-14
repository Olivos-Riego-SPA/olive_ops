'use client';

import { useRouter } from 'next/navigation';

/**
 * Navegación "atrás" que funciona en PWA standalone.
 *
 * En PWA con display:standalone el historial nativo arranca en 1 (solo la
 * página actual). Si history.length <= 1 no hay a dónde volver, así que
 * navegamos directo al fallback en vez de llamar router.back() en el vacío.
 *
 * Uso:
 *   const goBack = useSmartBack('/dashboard');
 *   <button onClick={goBack}>Volver</button>
 */
export function useSmartBack(fallbackPath: string): () => void {
  const router = useRouter();

  return () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };
}
