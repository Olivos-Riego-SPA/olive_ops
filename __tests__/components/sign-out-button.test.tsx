import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const mockTrack = vi.fn();
vi.mock('@/hooks/use-session-scan', () => ({
  useSessionScan: () => ({ track: mockTrack }),
}));

const mockSignOut = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  signOut: (...args: any[]) => mockSignOut(...args),
}));

import SignOutButton from '@/app/dashboard/components/sign-out-button';

describe('SignOutButton tracking', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('tracks logout on click', () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ops.session.logout' }),
    );
  });

  it('calls signOut after tracking', () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
