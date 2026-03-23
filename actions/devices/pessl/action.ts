'use server';

import { getPesslService, getPesslSensorDataService } from '@/services/devices/pessl/service';

export async function getAllPesslAction(): Promise<any[]> {
  try {
    return await getPesslService();
  } catch (error) {
    console.error('Error en getAllPesslAction:', error);
    return [];
  }
}

// Sensor group IDs: clima = 1,2,4,6,8,9,10,11,16,17,21,22,29,65,74 | suelo = 3,12,25,33,43,69
const PESSL_SENSOR_GROUPS = '1,2,4,6,8,9,10,11,16,17,21,22,29,65,74,3,12,25,33,43,69';
const CLIMA_GROUPS  = new Set([1,2,4,6,8,9,10,11,16,17,21,22,29,65,74]);
const SUELO_GROUPS  = new Set([3,12,25,33,43,69]);

export async function getPesslModulesAction(serial: string): Promise<{ hasWeatherModule: boolean; hasSoilModule: boolean }> {
  try {
    const sensors = await getPesslSensorDataService(serial, PESSL_SENSOR_GROUPS);
    return {
      hasWeatherModule: sensors.some((s: any) => CLIMA_GROUPS.has(s.group)),
      hasSoilModule:    sensors.some((s: any) => SUELO_GROUPS.has(s.group)),
    };
  } catch {
    return { hasWeatherModule: false, hasSoilModule: false };
  }
}
