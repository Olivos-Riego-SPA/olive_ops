'use server';

import { getClientsService } from '@/services/clients/service';

export async function getClientsAction(): Promise<any[]> {
  try {
    return await getClientsService();
  } catch (error) {
    console.error('Error en getClientsAction:', error);
    return [];
  }
}
