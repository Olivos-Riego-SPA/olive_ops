import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { SessionProvider } from '@/lib/session-provider';
import { UserProvider } from '@/context/userContext';
import { getSessionUser } from '@/lib/session';
import QueryProvider from '@/lib/query-provider';
import PwaRegister from '@/app/components/pwa-register';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const manrope = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Olive Ops',
  description: 'Plataforma de comando agrícola de precisión',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  const sessionData = user ? { user } : null;

  const clientUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isReadOnlyAdmin: user.isReadOnlyAdmin,
        zenoSamaMode: user.zenoSamaMode,
      }
    : null;

  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <UserProvider user={clientUser}>
            <SessionProvider session={sessionData}>
              {children}
              <Toaster theme="dark" position="top-right" richColors />
              <PwaRegister />
            </SessionProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
