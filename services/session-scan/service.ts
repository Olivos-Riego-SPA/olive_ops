'use server';

import { postApi } from '@/lib/fetch';
import type { CreateSessionScanDto } from '@/types/session-scan';

export async function logScanService(dto: CreateSessionScanDto): Promise<void> {
  await postApi('/session-scan', dto);
}

export async function logNavigateService(dto: CreateSessionScanDto): Promise<void> {
  await postApi('/session-scan/navigate', dto);
}

export async function logUiService(dto: CreateSessionScanDto): Promise<void> {
  await postApi('/session-scan/ui', dto);
}

export async function logExportService(dto: CreateSessionScanDto): Promise<void> {
  await postApi('/session-scan/export', dto);
}
