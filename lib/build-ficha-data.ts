'use server';

import { getCountrysidesAction } from '@/actions/countrysides/action';
import {
  getTalgilConnectedAction,
  getPesslConnectedAction,
  getTalgilRichForClientAction,
  getFlorapulseForClientAction,
  getDavisForClientAction,
  getUserLastLoginAction,
} from '@/actions/dashboard/action';
import { getAllPesslAction, getPesslModulesAction } from '@/actions/devices/pessl/action';
import { getSectorsAction } from '@/actions/sectors/action';
import { getWellsAction } from '@/actions/wells/wells';
import type {
  FichaData,
  FichaCampo,
  FichaTalgilDevice,
  FichaPesslDevice,
  FichaFlorapulseDevice,
  FichaDavisDevice,
  FichaUser,
} from '@/types/ficha';

// ── Helpers ────────────────────────────────────────────────────────────────────

const TALGIL_GROUPS = [
  'stationsLessThan1Hour',
  'stationsBetween1And3Hours',
  'stationsBetween3And24Hours',
  'stationsWithMoreThan24Hours',
] as const;

function findTalgilLastComm(serial: number, talgilConns: any): number | null {
  for (const key of TALGIL_GROUPS) {
    const found = (talgilConns?.[key] ?? []).find(
      (s: any) => String(s.serial) === String(serial)
    );
    if (found) return found.hoursSinceLastCommunication ?? null;
  }
  return null;
}

function findPesslLastComm(serial: number | string, pesslConns: any): number | null {
  // pesslConns is the first element of the array returned by getPesslConnectedAction
  if (!pesslConns) return null;
  for (const key of TALGIL_GROUPS) {
    const found = (pesslConns[key] ?? []).find(
      (s: any) => String(s.serial) === String(serial)
    );
    if (found) return found.hoursSinceLastCommunication ?? null;
  }
  return null;
}

function findLastLogin(userId: string, loginData: any): string | null {
  if (!loginData) return null;
  const { usersAlwaysLogin = [], usersNeverLogin = [] } = loginData;
  const found = [...usersAlwaysLogin, ...usersNeverLogin].find(
    (u: any) => u._id === userId
  );
  return found?.lastLoginInChile ?? null;
}

// ── Main builder ───────────────────────────────────────────────────────────────

/**
 * Fetches and assembles all data needed for the ficha print view.
 * Pass `campoId` to restrict to a single campo (ficha de campo).
 * Leave undefined for the full client ficha (ficha de cliente).
 */
export async function buildFichaData(
  clientId: string,
  campoId?: string
): Promise<FichaData | null> {
  // 1. Get all countrysides, filter to this client (and optionally one campo)
  const allCountrysides = await getCountrysidesAction();
  let campos = allCountrysides.filter((cs: any) => cs.clientId === clientId);
  if (campoId) campos = campos.filter((cs: any) => cs._id === campoId);
  if (campos.length === 0) return null;

  const clientName = campos[0].clientName ?? '';
  const campoIds   = campos.map((cs: any) => cs._id as string);

  // 2. Parallel fetches: connection data + device lists
  const [
    talgilConns,
    pesslConnsRaw,
    talgilRich,
    florapulse,
    davis,
    allPessl,
    loginData,
    allWells,
  ] = await Promise.all([
    getTalgilConnectedAction().catch(() => null),
    getPesslConnectedAction().catch(() => null),
    getTalgilRichForClientAction(campoIds),
    getFlorapulseForClientAction(campoIds),
    getDavisForClientAction(campoIds),
    getAllPesslAction().catch(() => [] as any[]),
    getUserLastLoginAction({ clientsIds: [], countrysidesIds: [] }).catch(() => null),
    getWellsAction().catch(() => [] as any[]),
  ]);

  // getPesslConnectedAction returns an array; take [0] (same as useMonitorData)
  const pesslConns = Array.isArray(pesslConnsRaw) ? pesslConnsRaw[0] : pesslConnsRaw;

  // 3. Process each campo
  const fichasCampos: FichaCampo[] = await Promise.all(
    campos.map(async (cs: any) => {
      const csId = cs._id as string;

      // Sectors for this campo
      const sectors = await getSectorsAction(csId, clientId).catch(() => [] as any[]);
      const totalSector = sectors.length;
      const kmlSector = sectors.filter(
        (s: any) => s.active && Array.isArray(s.coordinates) && s.coordinates.length > 0
      ).length;

      // ── Talgil devices ─────────────────────────────────────────────────────
      const campoTalgil = talgilRich.filter((d) => d.countryside === csId);
      const talgilDevices: FichaTalgilDevice[] = campoTalgil.map((d) => ({
        _id:          d._id,
        serial:       d.serial,
        name:         d.name,
        isDream:      (d as any).info?.app == 0 || (d as any).info?.app == 1,
        battery:      (d as any).battery?.percentage ?? 0,
        batteryStatus: (d as any).battery?.state?.name ?? '—',
        lastComm:     findTalgilLastComm(d.serial, talgilConns),
        totalRtus:    d.totalRtus ?? 0,
        errorRtus:    d.errorRtus ?? 0,
        alertRtus:    d.alertRtus ?? 0,
        hasIrrigation: d.hasIrrigation,
        hasPlantModule: d.hasPlantModule,
        hasSoilModule:  d.hasSoilModule,
        hasWell:       d.hasWell,
        hasDga:        d.hasDga,
        wells:         (allWells as any[]).filter((w: any) => String(w.serial) === String(d.serial)),
      }));

      // ── Pessl devices ──────────────────────────────────────────────────────
      const campoPessl = (allPessl as any[]).filter(
        (p: any) => p.countrysideData?._id === csId || p.countryside === csId
      );
      const pesslDevices: FichaPesslDevice[] = await Promise.all(
        campoPessl.map(async (p: any) => {
          const serial = String(p.serial);
          const name   = p.name?.custom ?? p.name?.original ?? p.name ?? '';
          const modules = await getPesslModulesAction(serial);
          return {
            _id:              p._id,
            serial,
            name,
            hasWeatherModule: modules.hasWeatherModule,
            hasSoilModule:    modules.hasSoilModule,
            lastComm:         findPesslLastComm(serial, pesslConns),
          };
        })
      );

      // ── Florapulse ─────────────────────────────────────────────────────────
      const florapulseDevices: FichaFlorapulseDevice[] = florapulse
        .filter((d) => d.countryside === csId)
        .map((d) => ({
          _id:              d._id,
          label:            d.label,
          p1:               d.p1 ?? null,
          p2:               d.p2 ?? null,
          pswitch:          d.pswitch ?? null,
          lastActivityChile: d.lastActivityChile,
          sectorsData:      d.sectorsData,
        }));

      // ── Davis ──────────────────────────────────────────────────────────────
      const davisDevices: FichaDavisDevice[] = davis
        .filter((d) => d.countryside_id === csId)
        .map((d) => ({
          _id:          d._id,
          station_id:   d.station_id,
          station_name: d.station_name,
          active:       d.active,
          last_update:  d.last_update,
        }));

      // ── Users of this campo ────────────────────────────────────────────────
      const rawUsers: any[] = cs.usersWithCountryside ?? [];
      const users: FichaUser[] = rawUsers.map((u: any) => ({
        _id:       u._id,
        name:      u.name,
        email:     u.email,
        lastLogin: findLastLogin(u._id, loginData),
      }));

      return {
        _id:    csId,
        name:   cs.name,
        active: cs.active ?? true,
        hasIrrigationModule: cs.hasIrrigationModule ?? false,
        hasPlantModule:      cs.hasPlantModule      ?? false,
        hasWeatherModule:    cs.hasWeatherModule     ?? false,
        hasSoilModule:       cs.hasSoilModule        ?? false,
        hasWellModule:       cs.hasWellModule        ?? false,
        totalSector,
        kmlSector,
        talgilDevices,
        pesslDevices,
        florapulseDevices,
        davisDevices,
        users,
      };
    })
  );

  return { clientId, clientName, campos: fichasCampos };
}
