import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SessionScanProvider, useScanSessionId } from '@/context/sessionScanContext';

function ScanIdDisplay() {
  const id = useScanSessionId();
  return <span data-testid="scan-id">{id ?? 'null'}</span>;
}

describe('SessionScanContext', () => {
  afterEach(cleanup);
  it('provides scanSessionId to children', () => {
    render(
      <SessionScanProvider scanSessionId="test-session-123">
        <ScanIdDisplay />
      </SessionScanProvider>,
    );
    expect(screen.getByTestId('scan-id').textContent).toBe('test-session-123');
  });

  it('provides null when scanSessionId is null', () => {
    render(
      <SessionScanProvider scanSessionId={null}>
        <ScanIdDisplay />
      </SessionScanProvider>,
    );
    expect(screen.getByTestId('scan-id').textContent).toBe('null');
  });

  it('defaults to null when used outside provider', () => {
    render(<ScanIdDisplay />);
    expect(screen.getByTestId('scan-id').textContent).toBe('null');
  });
});
