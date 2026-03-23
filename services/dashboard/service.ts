import { getApi } from '@/lib/fetch';

export async function getTalgilConnectedService(): Promise<any> {
  const response = await getApi('/logger/station/talgil/information');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getPesslConnectedService(): Promise<any> {
  const response = await getApi('/logger/station/pessl/information');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getWellStatusService(): Promise<any[]> {
  const response = await getApi('/logger/well/status');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getBatteryLogService(): Promise<any[]> {
  const response = await getApi('/targets/battery/information');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getRtuListService(): Promise<any[]> {
  const response = await getApi('/rtu/all-info');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getRtuDetailsService(
  fechaIni: string,
  fechaFin: string,
  rtuId: string,
): Promise<{ date: string; state: number }[]> {
  const response = await getApi(`/rtu/history/${rtuId}/dateIni/${fechaIni}/dateEnd/${fechaFin}`);
  if (response.code === 200) return response.data ?? [];
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getTalgilRichService(): Promise<any[]> {
  const response = await getApi('/targets/simple/information');
  if (response.code === 200) return response.data ?? [];
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getFlorapulseDevicesService(): Promise<any[]> {
  const response = await getApi('/plant');
  if (response.code === 200) return response.data ?? [];
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getDavisDevicesService(): Promise<any[]> {
  const response = await getApi('/davis/stations');
  if (response.code === 200) return response.data ?? [];
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}
