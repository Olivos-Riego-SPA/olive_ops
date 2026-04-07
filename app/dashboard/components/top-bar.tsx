'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';

interface TopBarProps {
  userName: string | null | undefined;
}

export default function TopBar({ userName }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { track } = useSessionScan();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    setOpen(false);
    track(OPS.logout());
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (pathname.includes('/imprimir')) return null;

  return (
    <header className="sticky top-0 z-50 h-12 bg-surface-container-low flex items-center justify-between px-4 print:hidden">
      {/* ── Izquierda: logo + wordmark ── */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/logos/OPSMin.png"
          alt="OPS"
          width={28}
          height={28}
          className="object-contain"
          priority
        />
        <span className="font-display font-bold text-label-lg tracking-label text-secondary">
          OPS
        </span>
      </div>

      {/* ── Derecha: avatar + dropdown ── */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => { const next = !open; setOpen(next); if (next) track(OPS.userMenuOpen()); }}
          className="w-8 h-8 flex items-center justify-center rounded-sm bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Menú de usuario"
        >
          <FiUser size={17} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-10 w-52 glass rounded-sm overflow-hidden"
            style={{ boxShadow: 'var(--shadow-float)' }}
          >
            {/* Bienvenido */}
            <div className="px-4 py-3 bg-surface-container-low">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-label font-display">
                Bienvenido
              </p>
              <p className="text-body-sm font-semibold text-on-surface mt-0.5 truncate">
                {userName ?? 'Usuario'}
              </p>
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-on-surface-variant hover:text-tertiary hover:bg-surface-container-highest transition-colors"
            >
              <FiLogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
