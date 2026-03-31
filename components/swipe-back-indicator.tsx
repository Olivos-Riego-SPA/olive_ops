'use client';

interface SwipeBackIndicatorProps {
  pullX    : number;
  going    : boolean;
  threshold: number;
  maxPull  : number;
}

/**
 * Indicador visual de swipe-back.
 * Aparece desde el borde izquierdo cuando el usuario arrastra horizontalmente.
 */
export function SwipeBackIndicator({ pullX, going, threshold, maxPull }: SwipeBackIndicatorProps) {
  if (pullX === 0 && !going) return null;

  const progress   = Math.min(pullX / threshold, 1);
  const triggered  = going || pullX >= threshold;
  const translateX = going ? threshold * 0.6 : Math.round(pullX * 0.55);

  return (
    <div
      className="fixed top-0 left-0 bottom-0 z-50 flex items-center pointer-events-none"
      style={{ transform: `translateX(${translateX}px)` }}
    >
      <div
        className="w-10 h-10 rounded-full bg-secondary shadow-lg flex items-center justify-center"
        style={{ opacity: 0.5 + progress * 0.5 }}
      >
        <svg
          className="w-5 h-5 text-on-secondary transition-transform duration-150"
          style={{ transform: triggered ? 'scale(1.15)' : 'scale(1)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  );
}
