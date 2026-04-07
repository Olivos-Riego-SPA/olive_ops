import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

const mockFichaData = {
  clientName: 'Cliente Test',
  generatedBy: 'admin',
  campos: [
    {
      campoName: 'Campo Norte',
      campoId: 'f1',
      talgilDevices: [],
      pesslDevices: [],
      florapulseDevices: [],
      davisDevices: [],
      pozos: [],
      users: [],
    },
  ],
};

vi.mock('@/lib/build-ficha-data', () => ({
  buildFichaData: vi.fn(() => Promise.resolve(mockFichaData)),
}));

import FichaClientePrint from '@/app/dashboard/cliente/[clientId]/imprimir/components/ficha-cliente-print';

describe('FichaClientePrint tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks printFichaCliente on mount', async () => {
    render(<FichaClientePrint clientId="c1" />);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.print.ficha-cliente', entityId: 'c1' }),
    );
  });

  it('tracks printBack when back button is clicked', async () => {
    render(<FichaClientePrint clientId="c1" />);
    await waitFor(() => screen.getByText('Volver'));
    mockTrack.mockClear();

    fireEvent.click(screen.getByText('Volver'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.print.back' }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('tracks printSavePdf when print button is clicked', async () => {
    window.print = vi.fn();
    render(<FichaClientePrint clientId="c1" />);
    await waitFor(() => screen.getByText(/Imprimir/));
    mockTrack.mockClear();

    fireEvent.click(screen.getByText(/Imprimir/));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.print.save-pdf', entityId: 'c1' }),
    );
    expect(window.print).toHaveBeenCalled();
  });
});
