'use client';

import { useCallback } from 'react';
import { useScanSessionId } from '@/context/sessionScanContext';
import { logScanAction } from '@/actions/session-scan/action';
import type { SessionScanEvent } from '@/types/session-scan';

export function useSessionScan() {
  const scanSessionId = useScanSessionId();

  const track = useCallback(
    (event: SessionScanEvent) => {
      if (!scanSessionId) return;

      logScanAction({ ...event, sessionId: scanSessionId }).catch(() => {});
    },
    [scanSessionId],
  );

  return { track };
}
