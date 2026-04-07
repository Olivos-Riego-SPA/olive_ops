import { getSession, destroySession } from '@/lib/session';
import { logScanService } from '@/services/session-scan/service';
import { OpsScanModule, ScanActionType } from '@/types/session-scan';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getSession();

    // Fire-and-forget: log logout antes de destruir la sesión
    if (session.user) {
      logScanService({
        sessionId: session.user.scanSessionId ?? '',
        userId: session.user.id,
        userEmail: session.user.email ?? '',
        userRole: {
          isAdmin: session.user.isAdmin,
          isReadOnlyAdmin: session.user.isReadOnlyAdmin,
          zenoSamaMode: session.user.zenoSamaMode,
        },
        scanModule: OpsScanModule.OPS_SESSION,
        action: 'ops.session.logout',
        actionType: ScanActionType.LOGOUT,
        description: 'Cierre de sesión en Olive Ops',
      }).catch(() => {});
    }

    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
