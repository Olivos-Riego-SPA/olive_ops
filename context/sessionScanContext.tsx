'use client';

import { createContext, useContext } from 'react';

interface SessionScanContextType {
  scanSessionId: string | null;
}

const SessionScanContext = createContext<SessionScanContextType>({
  scanSessionId: null,
});

export function SessionScanProvider({
  scanSessionId,
  children,
}: {
  scanSessionId: string | null;
  children: React.ReactNode;
}) {
  return (
    <SessionScanContext.Provider value={{ scanSessionId }}>
      {children}
    </SessionScanContext.Provider>
  );
}

export function useScanSessionId(): string | null {
  return useContext(SessionScanContext).scanSessionId;
}
