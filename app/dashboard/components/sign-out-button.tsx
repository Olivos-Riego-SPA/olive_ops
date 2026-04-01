'use client';

import { signOut } from '@/lib/auth-client';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';

export default function SignOutButton() {
  const { track } = useSessionScan();
  return (
    <button
      onClick={() => { track(OPS.logout()); signOut(); }}
      className="mt-8 px-6 py-2 rounded-sm border border-outline-variant text-label-md text-on-surface-variant font-display uppercase tracking-label hover:border-tertiary hover:text-tertiary transition-colors duration-(--duration-fast)"
    >
      Cerrar sesión
    </button>
  );
}
