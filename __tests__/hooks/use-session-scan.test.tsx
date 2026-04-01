import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SessionScanProvider } from '@/context/sessionScanContext';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';
import type { ReactNode } from 'react';

// Mock the server action
vi.mock('@/actions/session-scan/action', () => ({
  logScanAction: vi.fn(() => Promise.resolve()),
}));

import { logScanAction } from '@/actions/session-scan/action';

const mockLogScanAction = vi.mocked(logScanAction);

function wrapper(scanSessionId: string | null) {
  return ({ children }: { children: ReactNode }) => (
    <SessionScanProvider scanSessionId={scanSessionId}>
      {children}
    </SessionScanProvider>
  );
}

describe('useSessionScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a track function', () => {
    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-1'),
    });
    expect(typeof result.current.track).toBe('function');
  });

  it('track calls logScanAction with sessionId and event', () => {
    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-abc'),
    });

    act(() => {
      result.current.track(OPS.healthView());
    });

    expect(mockLogScanAction).toHaveBeenCalledTimes(1);
    expect(mockLogScanAction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'sess-abc',
        scanModule: 'ops.health-dashboard',
        action: 'ops.health.view',
      }),
    );
  });

  it('track does NOT call logScanAction when scanSessionId is null', () => {
    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper(null),
    });

    act(() => {
      result.current.track(OPS.healthView());
    });

    expect(mockLogScanAction).not.toHaveBeenCalled();
  });

  it('track merges event overrides into the call', () => {
    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-xyz'),
    });

    act(() => {
      result.current.track(OPS.healthSearch({ metadata: { query: 'olivos' } }));
    });

    expect(mockLogScanAction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'sess-xyz',
        action: 'ops.health.search',
        metadata: { query: 'olivos' },
      }),
    );
  });

  it('track is stable across re-renders (same reference)', () => {
    const { result, rerender } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-stable'),
    });

    const firstTrack = result.current.track;
    rerender();
    expect(result.current.track).toBe(firstTrack);
  });

  it('track swallows logScanAction errors silently', async () => {
    mockLogScanAction.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-err'),
    });

    // Should not throw
    act(() => {
      result.current.track(OPS.healthView());
    });

    expect(mockLogScanAction).toHaveBeenCalledTimes(1);
  });

  it('track includes entity info when provided', () => {
    const { result } = renderHook(() => useSessionScan(), {
      wrapper: wrapper('sess-entity'),
    });

    act(() => {
      result.current.track(
        OPS.healthSelectClient({ entityId: 'c1', entityName: 'Cliente A' }),
      );
    });

    expect(mockLogScanAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'c1',
        entityName: 'Cliente A',
        actionType: 'scan.navigate',
      }),
    );
  });
});
