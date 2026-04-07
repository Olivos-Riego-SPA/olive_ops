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
    (globalThis as any).__campoListPullCb = onRefresh;
    return { pullY: 0, refreshing: false };
  },
}));

vi.mock('@/hooks/use-swipe-back', () => ({
  useSwipeBack: () => ({ pullX: 0, going: false, threshold: 60, maxPull: 120 }),
}));

vi.mock('@/components/pull-indicator', () => ({ PullIndicator: () => null }));
vi.mock('@/components/swipe-back-indicator', () => ({ SwipeBackIndicator: () => null }));

const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: vi.fn() }),
}));

const mockClientList: ClientSalud[] = [
  {
    clientId: 'c1',
    clientName: 'Cliente Test',
    globalScore: 90,
    globalStatus: 'ok',
    hasTalgil: true, talgilCount: 1, talgilScore: 0.95,
    hasPessl: false, pesslCount: 0, pesslScore: null,
    hasPozos: false, pozosCount: 0, pozosScore: null,
    campos: [
      {
        campoId: 'f1',
        campoName: 'Campo Norte',
        score: 0.95,
        status: 'ok',
        talgilDevices: [],
        pesslDevices: [],
        pozos: [],
        topProblems: [],
      },
      {
        campoId: 'f2',
        campoName: 'Campo Sur',
        score: 0.6,
        status: 'warning',
        talgilDevices: [],
        pesslDevices: [],
        pozos: [],
        topProblems: ['Sin comunicación'],
      },
    ],
    topProblems: [],
  },
];

vi.mock('@/lib/calc-client-salud', () => ({
  buildClientSaludList: () => mockClientList,
  formatHours: (h: number) => `${h}h`,
  scoreToStatus: (s: number) => (s >= 0.8 ? 'ok' : s >= 0.5 ? 'warning' : 'critical'),
}));

vi.mock('@/hooks/use-monitor-data', () => ({
  useMonitorData: () => ({
    talgilConns: { data: {}, isLoading: false },
    batteryList: { data: [], isLoading: false },
    rtuList: { data: [], isLoading: false },
    pesslDevices: { data: [], isLoading: false },
    wellStatus: { data: [], isLoading: false },
    countrysides: { data: [], isLoading: false },
    clients: { data: [{ _id: 'c1', name: 'Cliente Test', category: 'Q1' }], isLoading: false },
    refetchAll: mockRefetchAll,
    isLoading: false,
    isRefetching: false,
  }),
}));

import CampoList from '@/app/dashboard/cliente/[clientId]/components/campo-list';

describe('CampoList tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks clientFieldsView on mount', () => {
    render(<CampoList clientId="c1" />);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.view', entityId: 'c1' }),
    );
  });

  it('tracks clientFieldsBack when back button is clicked', () => {
    render(<CampoList clientId="c1" />);
    mockTrack.mockClear();

    // Use the labeled button to avoid ambiguity
    fireEvent.click(screen.getByLabelText('Volver'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.back' }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('tracks clientFieldsSearch with debounce', () => {
    vi.useFakeTimers();
    render(<CampoList clientId="c1" />);
    mockTrack.mockClear();

    fireEvent.change(screen.getByPlaceholderText('Buscar campo...'), { target: { value: 'Norte' } });

    expect(mockTrack).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.search' }),
    );

    act(() => { vi.advanceTimersByTime(600); });
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.search', metadata: { query: 'Norte' } }),
    );
    vi.useRealTimers();
  });

  it('tracks clientFieldsRefresh on pull-to-refresh', () => {
    render(<CampoList clientId="c1" />);
    mockTrack.mockClear();

    const cb = (globalThis as any).__campoListPullCb;
    cb();

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.refresh' }),
    );
  });

  it('tracks clientFieldsSelectCampo when a campo card is clicked', () => {
    render(<CampoList clientId="c1" />);
    mockTrack.mockClear();

    const link = screen.getByText('Campo Norte').closest('a');
    fireEvent.click(link!);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.select-campo', entityId: 'f1', entityName: 'Campo Norte' }),
    );
  });

  it('tracks clientFieldsPrint when print link is clicked', () => {
    render(<CampoList clientId="c1" />);
    mockTrack.mockClear();

    const link = screen.getByText('Ficha cliente').closest('a');
    fireEvent.click(link!);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.client-fields.print', entityId: 'c1' }),
    );
  });
});
