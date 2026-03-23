'use server';

import { getSectorsService } from '@/services/sectors/service';

export async function getSectorsAction(campoId?: string, clientId?: string): Promise<any[]> {
  try {
    return await getSectorsService(campoId, clientId);
  } catch (error) {
    console.error('Error en getSectorsAction:', error);
    return [];
  }
}
