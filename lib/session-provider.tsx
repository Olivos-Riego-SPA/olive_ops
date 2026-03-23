'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  token: string;
  refreshToken: string;
  tokenExpires?: number;
  refreshTokenExpires?: number;
  accessTokenExpiresAt?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
  refreshTokenExpiresIn?: string;
  isAdmin: boolean;
  isReadOnlyAdmin: boolean;
}

interface SessionContextType {
  data: { user: User | null } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: { user: User | null } | null;
}) {
  const [session, setSession] = useState<{ user: User | null } | null>(initialSession);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    initialSession?.user ? 'authenticated' : 'unauthenticated'
  );

  useEffect(() => {
    if (initialSession?.user) {
      setSession(initialSession);
      setStatus('authenticated');
    } else {
      setSession(null);
      setStatus('unauthenticated');
    }
  }, [initialSession]);

  const update = async () => {
    try {
      const response = await fetch('/api/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setStatus(data.session?.user ? 'authenticated' : 'unauthenticated');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ data: session, status, update }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
