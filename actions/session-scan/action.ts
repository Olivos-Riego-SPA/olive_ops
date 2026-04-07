'use server';

import { getSessionUser } from '@/lib/session';
import {
  logScanService,
  logNavigateService,
  logUiService,
  logExportService,
} from '@/services/session-scan/service';
import { ScanActionType } from '@/types/session-scan';
import type { SessionScanEvent, CreateSessionScanDto } from '@/types/session-scan';

export async function logScanAction(
  event: SessionScanEvent & { sessionId: string },
): Promise<void> {
  try {
    const user = await getSessionUser();
    if (!user) return;

    const dto: CreateSessionScanDto = {
      sessionId: event.sessionId,
      userId: user.id,
      userEmail: user.email ?? '',
      userRole: {
        isAdmin: user.isAdmin,
        isReadOnlyAdmin: user.isReadOnlyAdmin,
        zenoSamaMode: user.zenoSamaMode,
      },
      scanModule: event.scanModule,
      action: event.action,
      actionType: event.actionType,
      description: event.description,
      entity: event.entity,
      entityId: event.entityId,
      entityName: event.entityName,
      metadata: event.metadata,
      success: event.success ?? true,
      errorMessage: event.errorMessage,
    };

    switch (event.actionType) {
      case ScanActionType.NAVIGATE:
        await logNavigateService(dto);
        break;
      case ScanActionType.UI:
        await logUiService(dto);
        break;
      case ScanActionType.EXPORT:
        await logExportService(dto);
        break;
      default:
        await logScanService(dto);
    }
  } catch (error) {
    console.error('[session-scan] Error logging event:', error);
  }
}
