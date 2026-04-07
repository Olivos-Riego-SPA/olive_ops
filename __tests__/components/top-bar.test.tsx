import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

import TopBar from '@/app/dashboard/components/top-bar';

describe('TopBar tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ success: true }))));
  });
  afterEach(cleanup);

  it('tracks userMenuOpen when avatar button is clicked to open', () => {
    render(<TopBar userName="Test User" />);
    const avatarBtn = screen.getByLabelText('Menú de usuario');

    fireEvent.click(avatarBtn);

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.ui.user-menu-open' }),
    );
  });

  it('does NOT track userMenuOpen when closing the menu', () => {
    render(<TopBar userName="Test User" />);
    const avatarBtn = screen.getByLabelText('Menú de usuario');

    fireEvent.click(avatarBtn); // open
    mockTrack.mockClear();

    fireEvent.click(avatarBtn); // close
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('tracks logout when "Cerrar sesión" is clicked', async () => {
    render(<TopBar userName="Test User" />);

    // Open menu first
    fireEvent.click(screen.getByLabelText('Menú de usuario'));
    mockTrack.mockClear();

    // Click logout
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.session.logout' }),
    );
  });
});
