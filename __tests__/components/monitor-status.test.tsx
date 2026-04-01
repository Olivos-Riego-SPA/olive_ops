import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockRefetchAll = vi.fn();
vi.mock('@/hooks/use-monitor-data', () => ({
  useMonitorData: () => ({
    talgilConns: { data: { stationsLessThan1Hour: [1, 2], stationsBetween1And3Hours: [] }, isLoading: false },
    pesslConns: { data: { stationsLessThan1Hour: [], stationsBetween1And3Hours: [] }, isLoading: false },
    batteryList: { data: [], isLoading: false },
    rtuList: { data: [], isLoading: false },
    wellStatus: { data: [], isLoading: false },
    pesslDevices: { data: [], isLoading: false },
    wellDevices: { data: [], isLoading: false },
    countrysides: { data: [], isLoading: false },
    clients: { data: [], isLoading: false },
    refetchAll: mockRefetchAll,
    isLoading: false,
    isRefetching: false,
  }),
}));

import MonitorStatus from '@/app/dashboard/components/monitor-status';

describe('MonitorStatus tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks monitorRefresh when "Refrescar" is clicked', () => {
    render(<MonitorStatus />);
    fireEvent.click(screen.getByText('Refrescar'));

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.monitor.refresh' }),
    );
  });

  it('calls refetchAll after tracking', () => {
    render(<MonitorStatus />);
    fireEvent.click(screen.getByText('Refrescar'));

    expect(mockRefetchAll).toHaveBeenCalledTimes(1);
  });
});
