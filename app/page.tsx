import { Suspense } from 'react';
import Image from 'next/image';
import LoginForm from './(auth)/components/login-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <Image
            src="/logos/OPSLogo.png"
            alt="Olive OPS"
            width={220}
            height={40}
            className="mb-3 object-contain"
            priority
          />
          <h1 className="font-display text-headline-sm font-semibold text-on-surface uppercase tracking-label leading-display">
            Centro de Comando
          </h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Acceso exclusivo para personal de operaciones.
          </p>
        </div>

        {/* Card de login */}
        <div className="glass rounded-md p-8" style={{ boxShadow: 'var(--shadow-float)' }}>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-label-sm text-outline">
          Plataforma Olive+ — Operaciones
        </p>
      </div>
    </main>
  );
}
