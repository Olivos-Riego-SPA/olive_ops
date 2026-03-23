'use server';

import {
  getBatteryLogService,
  getDavisDevicesService,
  getFlorapulseDevicesService,
  getPesslConnectedService,
  getRtuDetailsService,
  getRtuListService,
  getTalgilConnectedService,
  getTalgilRichService,
  getWellStatusService,
} from '@/services/dashboard/service';
import { getUserLastLoginService, type UserLastLoginRequest } from '@/services/logger/service';
import type { DavisDevice, FlorapulseDevice, TalgilRich } from '@/types/campo-detalle-extra';

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutos

let talgilConnectedCache: { timestamp: number; data: any } | null = null;
let pesslConnectedCache:  { timestamp: number; data: any } | null = null;
let wellStatusCache:      { timestamp: number; data: any[] } | null = null;
let batteryLogCache:      { timestamp: number; data: any[] } | null = null;
let rtuListCache:         { timestamp: number; data: any[] } | null = null;

export async function getTalgilConnectedAction(): Promise<any> {
  const now = Date.now();
  if (talgilConnectedCache && now - talgilConnectedCache.timestamp < CACHE_DURATION_MS) {
    return talgilConnectedCache.data;
  }
  const data = await getTalgilConnectedService();
  talgilConnectedCache = { timestamp: now, data };
  return data;
}

export async function getPesslConnectedAction(): Promise<any> {
  const now = Date.now();
  if (pesslConnectedCache && now - pesslConnectedCache.timestamp < CACHE_DURATION_MS) {
    return pesslConnectedCache.data;
  }
  const data = await getPesslConnectedService();
  pesslConnectedCache = { timestamp: now, data };
  return data;
}

export async function getWellStatusAction(): Promise<any[]> {
  const data = await getWellStatusService();
  return data;
}

export async function getBatteryLogAction(): Promise<any[]> {
  const now = Date.now();
  if (batteryLogCache && now - batteryLogCache.timestamp < CACHE_DURATION_MS) {
    return batteryLogCache.data;
  }
  const data = await getBatteryLogService();
  batteryLogCache = { timestamp: now, data };
  return data;
}

export async function getRtuListAction(): Promise<any[]> {
  const now = Date.now();
  if (rtuListCache && now - rtuListCache.timestamp < CACHE_DURATION_MS) {
    return rtuListCache.data;
  }
  const data = await getRtuListService();
  rtuListCache = { timestamp: now, data };
  return data;
}

export async function clearCacheDevice(): Promise<boolean> {
  talgilConnectedCache = null;
  pesslConnectedCache  = null;
  wellStatusCache      = null;
  batteryLogCache      = null;
  rtuListCache         = null;
  return true;
}

export async function getRtuDetailsAction(
  rtuId: string,
): Promise<{ date: string; state: number }[]> {
  if (!rtuId) return [];
  const today = new Date();
  const ago   = new Date();
  ago.setDate(today.getDate() - 2);
  today.setDate(today.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  try {
    return await getRtuDetailsService(fmt(ago), fmt(today), rtuId);
  } catch {
    return [];
  }
}

export async function getTalgilRichAction(campoId: string): Promise<TalgilRich[]> {
  try {
    const data = await getTalgilRichService();
    return (data as any[]).filter((d: any) => d.countryside === campoId);
  } catch {
    return [];
  }
}

export async function getFlorapulseAction(campoId: string): Promise<FlorapulseDevice[]> {
  try {
    const data = await getFlorapulseDevicesService();
    return (data as any[]).filter((d: any) => d.countryside === campoId && d.is_active);
  } catch {
    return [];
  }
}

export async function getDavisAction(campoId: string): Promise<DavisDevice[]> {
  try {
    const data = await getDavisDevicesService();
    return (data as any[]).filter((d: any) => d.countryside_id === campoId && d.active);
  } catch {
    return [];
  }
}

export async function getTalgilRichForClientAction(campoIds: string[]): Promise<TalgilRich[]> {
  if (campoIds.length === 0) return [];
  try {
    const data = await getTalgilRichService();
    return (data as any[]).filter((d: any) => campoIds.includes(d.countryside));
  } catch {
    return [];
  }
}

export async function getFlorapulseForClientAction(campoIds: string[]): Promise<FlorapulseDevice[]> {
  if (campoIds.length === 0) return [];
  try {
    const data = await getFlorapulseDevicesService();
    return (data as any[]).filter((d: any) => campoIds.includes(d.countryside) && d.is_active);
  } catch {
    return [];
  }
}

export async function getDavisForClientAction(campoIds: string[]): Promise<DavisDevice[]> {
  if (campoIds.length === 0) return [];
  try {
    const data = await getDavisDevicesService();
    return (data as any[]).filter((d: any) => campoIds.includes(d.countryside_id) && d.active);
  } catch {
    return [];
  }
}

export async function getUserLastLoginAction(req: UserLastLoginRequest): Promise<any> {
  try {
    return await getUserLastLoginService(req);
  } catch {
    return null;
  }
}
