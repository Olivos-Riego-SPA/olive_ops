'use server';

import { getWellsService } from '@/services/wells/wellService';

export async function getWellsAction(): Promise<any[]> {
  try {
    return await getWellsService();
  } catch (error) {
    console.error('Error en getWellsAction:', error);
    return [];
  }
}
