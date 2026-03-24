'use client';

import { PULL_THRESHOLD } from '@/hooks/use-pull-to-refresh';

interface PullIndicatorProps {
  pullY: number;
  refreshing: boolean;
}

/**
 * Indicador visual de pull-to-refresh.
 * Aparece en la parte superior de la pantalla cuando el usuario arrastra hacia abajo.
 */
export function PullIndicator({ pullY, refreshing }: PullIndicatorProps) {
  if (pullY === 0 && !refreshing) return null;

  const progress  = Math.min(pullY / PULL_THRESHOLD, 1);
  const triggered = pullY >= PULL_THRESHOLD;
  const translateY = refreshing ? 14 : Math.round(pullY * 0.45);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <div
        className="w-10 h-10 rounded-full bg-secondary shadow-lg flex items-center justify-center"
        style={{ opacity: Math.max(0.6, progress) }}
      >
        {refreshing ? (
          /* Spinner */
          <svg className="w-5 h-5 text-on-secondary animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          /* Flecha que rota al llegar al threshold */
          <svg
            className="w-5 h-5 text-on-secondary transition-transform duration-200"
            style={{ transform: triggered ? 'rotate(180deg)' : `rotate(${Math.round(progress * 180)}deg)` }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
