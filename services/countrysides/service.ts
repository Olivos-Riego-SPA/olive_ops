import { getApi } from '@/lib/fetch';

export async function getCountrysidesService(): Promise<any[]> {
  const response = await getApi('/countryside');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}
