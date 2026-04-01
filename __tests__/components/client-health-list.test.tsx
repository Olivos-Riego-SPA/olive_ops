import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import type { ClientSalud } from '@/types/client-salud';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockRefetchAll = vi.fn(() => Promise.resolve());
vi.mock('@/hooks/use-pull-to-refresh', () => ({
  usePullToRefresh: (onRefresh: () => Promise<void>) => {
    (globalThis as any).__healthPullCb = onRefresh;
    return { pullY: 0, refreshing: false };
  },
}));

vi.mock('@/components/pull-indicator', () => ({
  PullIndicator: () => null,
}));

const mockClientList: ClientSalud[] = [
  {
    clientId: 'c1',
    clientName: 'Cliente Alfa',
    globalScore: 85,
    globalStatus: 'ok',
    hasTalgil: true, talgilCount: 2, talgilScore: 0.9,
    hasPessl: false, pesslCount: 0, pesslScore: null,
    hasPozos: false, pozosCount: 0, pozosScore: null,
    campos: [],
    topProblems: [],
  },
];

vi.mock('@/lib/calc-client-salud', () => ({
  buildClientSaludList: () => mockClientList,
}));

vi.mock('@/hooks/use-monitor-data', () => ({
  useMonitorData: () => ({
    talgilConns: { data: {}, isLoading: false },
    batteryList: { data: [], isLoading: false },
    rtuList: { data: [], isLoading: false },
    pesslDevices: { data: [], isLoading: false },
    wellStatus: { data: [], isLoading: false },
    countrysides: { data: [], isLoading: false },
    clients: { data: [{ _id: 'c1', name: 'Cliente Alfa', category: 'Q1' }], isLoading: false },
    refetchAll: mockRefetchAll,
    isLoading: false,
    isRefetching: false,
  }),
}));

import ClientHealthList from '@/app/dashboard/components/client-health-list';

describe('ClientHealthList tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks healthView on mount', () => {
    render(<ClientHealthList />);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.view' }),
    );
  });

  it('tracks healthSearch with debounce', () => {
    vi.useFakeTimers();
    render(<ClientHealthList />);
    mockTrack.mockClear();

    fireEvent.change(screen.getByPlaceholderText('Buscar cliente...'), { target: { value: 'Alfa' } });

    expect(mockTrack).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.search' }),
    );

    act(() => { vi.advanceTimersByTime(600); });
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.search', metadata: { query: 'Alfa' } }),
    );
    vi.useRealTimers();
  });

  it('tracks healthSort when sort buttons are clicked', () => {
    render(<ClientHealthList />);
    mockTrack.mockClear();

    fireEvent.click(screen.getByText('Categoría'));
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.sort', metadata: { sortBy: 'category' } }),
    );

    mockTrack.mockClear();
    fireEvent.click(screen.getByText('% Salud'));
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.sort', metadata: { sortBy: 'score' } }),
    );
  });

  it('tracks healthRefresh on pull-to-refresh', () => {
    render(<ClientHealthList />);
    mockTrack.mockClear();

    const cb = (globalThis as any).__healthPullCb;
    expect(cb).toBeDefined();
    cb();

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.refresh' }),
    );
  });

  it('tracks healthSelectClient when a client card is clicked', () => {
    render(<ClientHealthList />);
    mockTrack.mockClear();

    const link = screen.getByText('Cliente Alfa').closest('a');
    expect(link).not.toBeNull();
    fireEvent.click(link!);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.health.select-client', entityId: 'c1' }),
    );
  });
});
