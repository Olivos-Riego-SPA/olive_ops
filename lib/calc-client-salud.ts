import type {
  ClientSalud,
  CampoSalud,
  TalgilSalud,
  PesslSalud,
  PozoSalud,
  HealthStatus,
} from '@/types/client-salud';

// ── Helpers ────────────────────────────────────────────────────────────────────

function hoursSince(dateStr: string): number {
  if (!dateStr) return 9999;
  return (Date.now() - new Date(dateStr).getTime()) / 3_600_000;
}

export function formatHoursShort(hours: number | null): string {
  if (hours === null || hours >= 9000) return 'sin fecha';
  if (hours < 1 / 60) return 'ahora';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

export function formatHours(hours: number | null): string {
  if (hours === null || hours >= 9000) return 'sin fecha';
  if (hours < 1 / 60) return 'ahora';
  if (hours < 1) return `hace ${Math.round(hours * 60)}m`;
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `hace ${h}h ${m}m` : `hace ${h}h`;
  }
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return h > 0 ? `hace ${d}d ${h}h` : `hace ${d}d`;
}

export function scoreToStatus(score: number): HealthStatus {
  if (score >= 0.8) return 'ok';
  if (score >= 0.5) return 'warning';
  return 'critical';
}

function calcTalgilScore(
  hours: number | null,
  isDisconnected: boolean,
  rtus: { total: number; ok: number } | null,
  batPct: number | null,
): number {
  if (isDisconnected) return 0.1;
  const h = hours ?? 9999;
  const conn = h <= 1 ? 1.0 : h <= 3 ? 0.85 : h <= 24 ? 0.6 : 0.2;
  const rtuFactor = rtus && rtus.total > 0 ? rtus.ok / rtus.total : 1.0;
  const bat =
    batPct != null && batPct > 0 && batPct < 20 ? 0.6
    : batPct != null && batPct > 0 && batPct < 50 ? 0.85
    : 1.0;
  return conn * rtuFactor * bat;
}

function calcPesslScore(hours: number): number {
  if (hours < 3)  return 1.0;
  if (hours < 24) return 0.7;
  return 0.2;
}

function calcCampoScore(t: TalgilSalud[], p: PesslSalud[], z: PozoSalud[]): number {
  const techAvgs: number[] = [];
  if (t.length > 0) techAvgs.push(t.reduce((a, x) => a + x.score, 0) / t.length);
  if (p.length > 0) techAvgs.push(p.reduce((a, x) => a + x.score, 0) / p.length);
  if (z.length > 0) techAvgs.push(z.reduce((a, x) => a + x.score, 0) / z.length);
  return techAvgs.length > 0 ? techAvgs.reduce((a, x) => a + x, 0) / techAvgs.length : 1.0;
}

// ── Input ──────────────────────────────────────────────────────────────────────

export interface BuildClientSaludInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  talgilConns: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  batteryList: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rtuList: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pesslDevices: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wellStatus: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countrysides: any[];
}

// ── Builder principal ──────────────────────────────────────────────────────────

export function buildClientSaludList(input: BuildClientSaludInput): ClientSalud[] {
  const { talgilConns, batteryList, rtuList, pesslDevices, wellStatus, countrysides } = input;

  // ── Maps de apoyo ────────────────────────────────────────────────────────────

  const batMap = new Map<string, number>();
  for (const e of batteryList)
    for (const d of (e.devices ?? []))
      if (d.serial != null && d.battery?.percentage != null)
        batMap.set(String(d.serial), d.battery.percentage);

  const rtuMap = new Map<string, typeof rtuList[0]>();
  for (const rtu of rtuList)
    if (rtu.serial) rtuMap.set(rtu.serial, rtu);

  const csMetaMap = new Map<string, { clientId: string; clientName: string; csName: string }>();
  for (const cs of countrysides)
    csMetaMap.set(cs._id, { clientId: cs.clientId, clientName: cs.clientName, csName: cs.name });

  // ── Árbol de construcción ────────────────────────────────────────────────────

  type CampoNode = {
    csName: string;
    talgilDevices: TalgilSalud[];
    pesslDevices: PesslSalud[];
    pozos: PozoSalud[];
  };
  type ClientNode = { clientName: string; campos: Map<string, CampoNode> };
  const tree = new Map<string, ClientNode>();

  const ensureClient = (clientId: string, clientName: string) => {
    if (!tree.has(clientId)) tree.set(clientId, { clientName, campos: new Map() });
  };
  const ensureCampo = (clientId: string, csId: string, csName: string) => {
    const node = tree.get(clientId)!;
    if (!node.campos.has(csId))
      node.campos.set(csId, { csName, talgilDevices: [], pesslDevices: [], pozos: [] });
  };

  // ── 1. Talgil ────────────────────────────────────────────────────────────────

  const TALGIL_GROUPS = [
    'stationsLessThan1Hour',
    'stationsBetween1And3Hours',
    'stationsBetween3And24Hours',
    'stationsWithMoreThan24Hours',
  ] as const;

  for (const key of TALGIL_GROUPS) {
    for (const st of (talgilConns ?? {})[key] ?? []) {
      if (!st.serial || !st.countryside) continue;
      const hours = st.hoursSinceLastCommunication ?? null;
      if (hours !== null && hours > 8000) continue;

      const csMeta = csMetaMap.get(st.countryside);
      if (!csMeta) continue;

      const serial  = String(st.serial);
      const batPct  = batMap.get(serial) ?? null;
      const rtu     = rtuMap.get(serial);
      const isDisc  = rtu?.isDisconnected === true;

      const RTU_STATE_LABELS: Record<string, string> = {
        '1': 'Error de interfaz',
        '2': 'Error de comunicación',
        '3': 'Batería baja',
        '4': 'En prueba',
        '5': 'Sin conexión',
      };

      const problemRtus = ((rtu?.rtusByState ?? []) as any[])
        .filter((g: any) => {
          const s = String(g.state ?? '').trim();
          return s !== '' && s !== '0' && s.toLowerCase() !== 'ok';
        })
        .flatMap((g: any) =>
          (g.rtus ?? []).map((r: any) => {
            // El state puede venir en el RTU individual o en el grupo
            const state = Number(r.state ?? g.state) || 1;
            return {
              name      : r.name ?? `RTU ${r.uid ?? r.serial ?? '?'}`,
              uid       : r.uid ?? r.serial ?? '',
              stateLabel: RTU_STATE_LABELS[String(state)] ?? `Estado ${state}`,
              state,
              _id       : r._id ?? '',
            };
          })
        );

      const errorRtus = problemRtus.filter(r => r.state === 1 || r.state === 2).length;
      const alertRtus = problemRtus.filter(r => r.state !== 1 && r.state !== 2).length;

      const rtus = rtu ? {
        total      : rtu.totalRTUs ?? 0,
        ok         : rtu.okRTUs    ?? 0,
        errors     : errorRtus,
        alerts     : alertRtus,
        problemRtus,
      } : null;

      const score  = calcTalgilScore(hours, isDisc, rtus, batPct);
      const status = scoreToStatus(score);

      const problems: string[] = [];
      if (isDisc) problems.push('Desconectado');
      else if (hours !== null && hours > 24) problems.push(`Sin com. ${formatHours(hours)}`);
      else if (hours !== null && hours > 3)  problems.push(`Com. lenta ${formatHours(hours)}`);
      if (batPct !== null && batPct > 0 && batPct < 20) problems.push(`Batería crítica ${batPct}%`);
      else if (batPct !== null && batPct > 0 && batPct < 50) problems.push(`Batería baja ${batPct}%`);
      if (rtus && rtus.errors > 0) problems.push(`${rtus.errors} RTU con error`);
      if (rtus && rtus.alerts > 0) problems.push(`${rtus.alerts} RTU con alerta`);

      ensureClient(csMeta.clientId, csMeta.clientName);
      ensureCampo(csMeta.clientId, st.countryside, st.countrysideName ?? csMeta.csName);
      tree.get(csMeta.clientId)!.campos.get(st.countryside)!.talgilDevices.push({
        serial, name: st.name ?? serial, hoursSinceComm: hours,
        batteryPct: batPct, rtus, score, status, problems,
      });
    }
  }

  // ── 2. Pessl ─────────────────────────────────────────────────────────────────

  for (const p of pesslDevices) {
    const csId     = p.countrysideData?._id ?? p.countryside;
    const clientId = p.clientData?._id;
    if (!csId || !clientId) continue;

    const hours  = hoursSince(p.dates?.last_communication ?? '');
    const score  = calcPesslScore(hours);
    const status = scoreToStatus(score);

    const problems: string[] = [];
    if (hours >= 9000)   problems.push('Sin fecha de comunicación');
    else if (hours > 24) problems.push(`Sin com. ${formatHours(hours)}`);
    else if (hours > 3)  problems.push(`Com. lenta ${formatHours(hours)}`);

    ensureClient(clientId, p.clientData?.name ?? clientId);
    ensureCampo(clientId, csId, p.countrysideData?.name ?? csId);
    tree.get(clientId)!.campos.get(csId)!.pesslDevices.push({
      serial        : p.serial,
      name          : p.name?.custom || p.name?.original || p.serial,
      hoursSinceComm: hours >= 9000 ? null : hours,
      score, status, problems,
    });
  }

  // ── 3. Pozos (via serial Talgil) ─────────────────────────────────────────────
  // code '0' = OK, code '1' = sin DGA (informacional), otros = error

  const wellBySerial = new Map<string, PozoSalud[]>();
  for (const group of wellStatus) {
    const groupCode = String(group.code ?? '');
    const isError   = groupCode !== '0' && groupCode !== '1';
    const isInfo    = groupCode === '1';

    for (const info of group.wells ?? []) {
      const w = info.well;
      if (!w?.serial) continue;
      const serial   = String(w.serial);
      const score    = isError ? 0.0 : 1.0;
      const status   = scoreToStatus(score);
      const problems: string[] = [];
      if (isError) problems.push(group.description ?? `Error DGA (${groupCode})`);

      if (!wellBySerial.has(serial)) wellBySerial.set(serial, []);
      wellBySerial.get(serial)!.push({
        wellId     : w._id ?? serial,
        name       : w.name ?? serial,
        hasError   : isError,
        hasWarning : isInfo,
        sendtodga  : w.sendtodga ?? false,
        pendingData: w.datosPendientesPorEnviar ?? null,
        score, status, problems,
      });
    }
  }

  // Cruzamos pozos con su campo via serial Talgil
  for (const clientNode of tree.values())
    for (const campo of clientNode.campos.values())
      campo.pozos = campo.talgilDevices.flatMap(t => wellBySerial.get(t.serial) ?? []);

  // ── 4. Construir ClientSalud[] ────────────────────────────────────────────────

  const result: ClientSalud[] = [];

  for (const [clientId, clientNode] of tree) {
    const campos: CampoSalud[] = [];

    for (const [campoId, campo] of clientNode.campos) {
      const score       = calcCampoScore(campo.talgilDevices, campo.pesslDevices, campo.pozos);
      const allProblems = [
        ...campo.talgilDevices.flatMap(t => t.problems),
        ...campo.pesslDevices.flatMap(p => p.problems),
        ...campo.pozos.flatMap(z => z.problems),
      ].filter((v, i, a) => a.indexOf(v) === i);

      campos.push({
        campoId,
        campoName   : campo.csName,
        talgilDevices: campo.talgilDevices,
        pesslDevices : campo.pesslDevices,
        pozos        : campo.pozos,
        score,
        status      : scoreToStatus(score),
        topProblems : allProblems.slice(0, 5),
      });
    }

    const globalScoreRaw = campos.length > 0
      ? campos.reduce((a, c) => a + c.score, 0) / campos.length
      : 1.0;

    const allTalgil = campos.flatMap(c => c.talgilDevices);
    const allPessl  = campos.flatMap(c => c.pesslDevices);
    const allPozos  = campos.flatMap(c => c.pozos);

    const allClientProblems = campos
      .flatMap(c => c.topProblems)
      .filter((v, i, a) => a.indexOf(v) === i);

    result.push({
      clientId,
      clientName   : clientNode.clientName,
      campos,
      globalScore  : Math.round(globalScoreRaw * 100),
      globalStatus : scoreToStatus(globalScoreRaw),
      topProblems  : allClientProblems.slice(0, 4),
      hasTalgil    : allTalgil.length > 0,
      hasPessl     : allPessl.length  > 0,
      hasPozos     : allPozos.length  > 0,
      talgilScore  : allTalgil.length > 0 ? allTalgil.reduce((a, t) => a + t.score, 0) / allTalgil.length : null,
      pesslScore   : allPessl.length  > 0 ? allPessl.reduce((a,  p) => a + p.score, 0) / allPessl.length  : null,
      pozosScore   : allPozos.length  > 0 ? allPozos.reduce((a,  z) => a + z.score, 0) / allPozos.length  : null,
      talgilCount  : allTalgil.length,
      pesslCount   : allPessl.length,
      pozosCount   : allPozos.length,
    });
  }

  // Ordenar: críticos primero → warnings → ok; dentro del grupo, menor score primero
  const STATUS_ORDER: Record<HealthStatus, number> = { critical: 0, warning: 1, ok: 2 };
  result.sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.globalStatus] - STATUS_ORDER[b.globalStatus];
    return statusDiff !== 0 ? statusDiff : a.globalScore - b.globalScore;
  });

  return result;
}
