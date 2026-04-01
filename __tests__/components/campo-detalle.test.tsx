import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { ClientSalud } from '@/types/client-salud';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockBack = vi.fn();
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

vi.mock('@/actions/dashboard/action', () => ({
  getRtuDetailsAction: vi.fn(() => Promise.resolve([])),
}));

const mockClientList: ClientSalud[] = [
  {
    clientId: 'c1',
    clientName: 'Cliente Test',
    globalScore: 85,
    globalStatus: 'ok',
    hasTalgil: true, talgilCount: 1, talgilScore: 0.95,
    hasPessl: true, pesslCount: 1, pesslScore: 1.0,
    hasPozos: false, pozosCount: 0, pozosScore: null,
    campos: [
      {
        campoId: 'f1',
        campoName: 'Campo Norte',
        score: 0.9,
        status: 'ok',
        talgilDevices: [
          {
            serial: 's1',
            name: 'Controlador A',
            status: 'ok' as const,
            score: 0.95,
            hoursSinceComm: 0.5,
            batteryPct: 85,
            rtus: {
              total: 4, ok: 3, errors: 1, alerts: 0,
              problemRtus: [
                { name: 'RTU-1', uid: 'uid-1', stateLabel: 'Error com.', state: 2, _id: 'rtu-id-1' },
              ],
            },
          },
        ],
        pesslDevices: [
          {
            serial: 'p1',
            name: 'Estación Meteo',
            status: 'ok' as const,
            score: 1.0,
            hoursSinceComm: 1.2,
            problems: [],
          },
        ],
        pozos: [],
        topProblems: [],
      },
    ],
    topProblems: [],
  },
];

vi.mock('@/lib/calc-client-salud', () => ({
  buildClientSaludList: () => mockClientList,
  formatHoursShort: (h: number) => `${h}h`,
}));

vi.mock('@/hooks/use-monitor-data', () => ({
  useMonitorData: () => ({
    talgilConns: { data: {}, isLoading: false },
    batteryList: { data: [], isLoading: false },
    rtuList: { data: [], isLoading: false },
    pesslDevices: { data: [], isLoading: false },
    wellStatus: { data: [], isLoading: false },
    countrysides: { data: [], isLoading: false },
    clients: { data: [], isLoading: false },
    refetchAll: vi.fn(),
    isLoading: false,
    isRefetching: false,
  }),
}));

import CampoDetalle from '@/app/dashboard/cliente/[clientId]/campo/[campoId]/components/campo-detalle';

describe('CampoDetalle tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks fieldDetailView on mount', () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.field-detail.view', entityId: 'f1' }),
    );
  });

  it('tracks section-level view events on mount (talgil, pessl)', () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.talgil.view-devices', entityId: 'f1' }),
    );
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.pessl.view-devices', entityId: 'f1' }),
    );
  });

  it('tracks fieldDetailBack when back button is clicked', () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    mockTrack.mockClear();

    // First "Volver" is the main button with a span inside
    const buttons = screen.getAllByText('Volver');
    fireEvent.click(buttons[0]);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.field-detail.back' }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('tracks fieldDetailPrint when print button is clicked', () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    mockTrack.mockClear();

    fireEvent.click(screen.getByText('Ficha campo'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.field-detail.print', entityId: 'f1' }),
    );
    expect(mockPush).toHaveBeenCalled();
  });

  it('tracks talgilExpandRtuProblems when RTU section is expanded', () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    mockTrack.mockClear();

    fireEvent.click(screen.getByText('RTU con problemas'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.talgil.expand-rtu-problems', entityId: 's1' }),
    );
  });

  it('tracks talgilViewRtuHistory when RTU detail row is tapped', async () => {
    render(<CampoDetalle clientId="c1" campoId="f1" />);
    mockTrack.mockClear();

    // Expand RTU problems first
    fireEvent.click(screen.getByText('RTU con problemas'));
    mockTrack.mockClear();

    // Click the RTU detail row
    fireEvent.click(screen.getByText('RTU-1'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.talgil.view-rtu-history', entityId: 'rtu-id-1' }),
    );
  });
});
