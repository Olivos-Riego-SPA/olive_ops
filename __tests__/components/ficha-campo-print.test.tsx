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

import FichaCampoPrint from '@/app/dashboard/cliente/[clientId]/campo/[campoId]/imprimir/components/ficha-campo-print';

describe('FichaCampoPrint tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks printFichaCampo on mount', async () => {
    render(<FichaCampoPrint clientId="c1" campoId="f1" />);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.print.ficha-campo', entityId: 'f1' }),
    );
  });

  it('tracks printBack when back button is clicked', async () => {
    render(<FichaCampoPrint clientId="c1" campoId="f1" />);
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
    render(<FichaCampoPrint clientId="c1" campoId="f1" />);
    await waitFor(() => screen.getByText(/Imprimir/));
    mockTrack.mockClear();

    fireEvent.click(screen.getByText(/Imprimir/));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.print.save-pdf', entityId: 'f1' }),
    );
    expect(window.print).toHaveBeenCalled();
  });
});
