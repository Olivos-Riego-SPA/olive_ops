import { getApi } from '@/lib/fetch';

export async function getSectorsService(campoId?: string, clientId?: string): Promise<any[]> {
  const cs = campoId && campoId !== 'all' ? campoId : '';
  const cl = clientId && clientId !== 'all' ? clientId : '';
  const response = await getApi(`/sector?countryside=${cs}&clientId=${cl}`);
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}
