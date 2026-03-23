import { getApi } from '@/lib/fetch';

export async function getPesslService(): Promise<any[]> {
  const response = await getApi('/soils/allStations');
  if (response.code === 200) return response.data;
  if (response.code === 401) throw new Error('No está autorizado');
  throw new Error(`Error ${response.code}: Error en la respuesta`);
}

export async function getPesslSensorDataService(serial: string, sensorTypes: string): Promise<any[]> {
  const response = await getApi(`/sensor/filterByGroup/${serial}/${sensorTypes}`);
  if (response.code === 200) return response.data ?? [];
  if (response.code === 401) throw new Error('No está autorizado');
  return []; // sensor data is best-effort, don't throw
}
