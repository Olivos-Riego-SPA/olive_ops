'use client';

import { createContext, useContext } from 'react';

export interface ClientUser {
  id: string;
  name?: string | null;
  email?: string | null;
  isAdmin: boolean;
  isReadOnlyAdmin: boolean;
  zenoSamaMode: boolean;
}

const UserContext = createContext<ClientUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: ClientUser | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Retorna los datos del usuario en cualquier componente cliente.
 * No expone tokens — solo datos de identidad y permisos.
 */
export function useUser(): ClientUser | null {
  return useContext(UserContext);
}
