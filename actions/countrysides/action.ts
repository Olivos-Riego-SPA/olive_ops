'use server';

import { getCountrysidesService } from '@/services/countrysides/service';

export async function getCountrysidesAction(): Promise<any[]> {
  try {
    return await getCountrysidesService();
  } catch (error) {
    console.error('Error en getCountrysidesAction:', error);
    return [];
  }
}

/**
 * Extrae la lista de clientes únicos a partir de los campos (countrysides).
 * Misma lógica que en plataforma-soporte.
 */
export async function getClientsFromCountrysidesAction(): Promise<{ clientId: string; clientName: string }[]> {
  try {
    const countrysides = await getCountrysidesService();
    const clientMap = new Map<string, string>();
    for (const c of countrysides) {
      if (c.clientId && c.clientName) {
        clientMap.set(c.clientId, c.clientName);
      }
    }
    return Array.from(clientMap.entries()).map(([clientId, clientName]) => ({ clientId, clientName }));
  } catch (error) {
    console.error('Error en getClientsFromCountrysidesAction:', error);
    return [];
  }
}
