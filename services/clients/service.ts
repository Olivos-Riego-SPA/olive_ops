import { getApi } from '@/lib/fetch';

export async function getClientsService(): Promise<any[]> {
  const response = await getApi('/client');
  if (response.code === 200) return response.data.filter((c: any) => !c.deleted);
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}
