'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMonitorData } from '@/hooks/use-monitor-data';
import { buildClientSaludList, formatHoursShort } from '@/lib/calc-client-salud';
import { getRtuDetailsAction } from '@/actions/dashboard/action';
import type { TalgilSalud, PesslSalud, PozoSalud, HealthStatus } from '@/types/client-salud';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<HealthStatus, { dot: string; text: string; label: string; bg: string; bar: string }> = {
  ok      : { dot: 'bg-secondary', text: 'text-secondary', label: 'OK',      bg: 'bg-secondary/10',  bar: 'bg-secondary' },
  warning : { dot: 'bg-tertiary',  text: 'text-tertiary',  label: 'Alerta',  bg: 'bg-tertiary/10',   bar: 'bg-tertiary'  },
  critical: { dot: 'bg-error',     text: 'text-error',     label: 'Crítico', bg: 'bg-error-container', bar: 'bg-error'   },
};

// ── CampoDetalle ──────────────────────────────────────────────────────────────

export default function CampoDetalle({ clientId, campoId }: { clientId: string; campoId: string }) {
  const router = useRouter();
  const monitor = useMonitorData();

  const isLoading =
    monitor.talgilConns.isLoading  ||
    monitor.batteryList.isLoading  ||
    monitor.rtuList.isLoading      ||
    monitor.pesslDevices.isLoading ||
    monitor.wellStatus.isLoading   ||
    monitor.countrysides.isLoading;

  const { client, campo } = useMemo(() => {
    if (isLoading) return { client: null, campo: null };
    const list  = buildClientSaludList({
      talgilConns : monitor.talgilConns.data,
      batteryList : monitor.batteryList.data  ?? [],
      rtuList     : monitor.rtuList.data      ?? [],
      pesslDevices: monitor.pesslDevices.data ?? [],
      wellStatus  : monitor.wellStatus.data   ?? [],
      countrysides: monitor.countrysides.data ?? [],
    });
    const foundClient = list.find(c => c.clientId === clientId) ?? null;
    const foundCampo  = foundClient?.campos.find(c => c.campoId === campoId) ?? null;
    return { client: foundClient, campo: foundCampo };
  }, [
    monitor.talgilConns.data, monitor.batteryList.data, monitor.rtuList.data,
    monitor.pesslDevices.data, monitor.wellStatus.data, monitor.countrysides.data,
    clientId, campoId, isLoading,
  ]);

  const pct    = campo ? Math.round(campo.score * 100) : 0;
  const st     = campo ? STATUS_STYLE[campo.status] : null;

  // DEBUG pozos
  if (campo?.pozos.length) {
    console.group(`[Pozos] ${campo.campoName}`);
    campo.pozos.forEach(p => console.log(p));
    console.groupEnd();
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-label-lg">Volver</span>
        </button>

        {/* Header Paso 3 */}
        <div>
          <p className="font-display text-label-lg uppercase tracking-label text-secondary mb-2">
            Paso 3
          </p>
          <h2 className="font-display text-display-md font-semibold text-on-surface leading-tight tracking-display">
            Estado del<br />
            <span className="text-secondary italic">Campo</span>
          </h2>
          <div className="flex gap-2 mt-4 mb-3">
            <span className="h-1 w-16 rounded-full bg-secondary" />
            <span className="h-1 w-16 rounded-full bg-secondary" />
            <span className="h-1 w-16 rounded-full bg-secondary" />
          </div>
          <p className="font-display text-body-md text-on-surface-variant">
            Revisión de dispositivos y estado de salud del campo
          </p>
        </div>

        {/* Resumen del campo */}
        {isLoading && <div className="bg-surface-container-low rounded-sm p-4 animate-pulse h-24" />}
        {!isLoading && campo && st && (
          <div className="bg-surface-container-low rounded-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-display text-label-sm text-on-surface-variant uppercase tracking-label">
                  {client?.clientName ?? '—'}
                </p>
                <h1 className="font-display text-title-lg font-bold text-on-surface">
                  {campo.campoName}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`font-display text-display-md font-bold tabular-nums leading-none ${st.text}`}>
                  {pct}%
                </span>
                <button
                  onClick={() => router.push(`/dashboard/cliente/${clientId}/campo/${campoId}/imprimir`)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-display text-label-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671L17.25 19.5m0 0l.345-5.71m0 0a41.956 41.956 0 00-10.59 0M3 7.5h18M3 7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h18A2.25 2.25 0 0023.25 18.75v-9A2.25 2.25 0 0021 7.5M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5" />
                  </svg>
                  Ficha campo
                </button>
              </div>
            </div>
            {/* Barra de salud */}
            <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div className={`h-full rounded-full ${st.bar} transition-[width]`} style={{ width: `${pct}%` }} />
            </div>
            {/* Top problems */}
            {campo.topProblems.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {campo.topProblems.map((p, i) => (
                  <span key={i} className="text-label-sm text-error bg-error-container px-2 py-0.5 rounded-sm">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skeletons */}
        {isLoading && <SkeletonDetalle />}

        {/* Not found */}
        {!isLoading && !campo && (
          <div className="py-16 text-center space-y-2">
            <p className="text-body-md text-on-surface-variant">Campo no encontrado</p>
            <button onClick={() => router.back()} className="text-label-md text-primary underline">
              Volver
            </button>
          </div>
        )}

        {campo && (
          <>
            {/* Sección Talgil */}
            {campo.talgilDevices.length > 0 && (
              <Section
                title="Talgil"
                subtitle="Controladores de riego"
                accentColor="text-primary"
                count={campo.talgilDevices.length}
                okCount={campo.talgilDevices.filter(t => t.status === 'ok').length}
              >
                {campo.talgilDevices.map(dev => (
                  <TalgilRow key={dev.serial} dev={dev} />
                ))}
              </Section>
            )}

            {/* Sección Pessl */}
            {campo.pesslDevices.length > 0 && (
              <Section
                title="Pessl"
                subtitle="Estaciones meteo / suelo"
                accentColor="text-on-surface-variant"
                count={campo.pesslDevices.length}
                okCount={campo.pesslDevices.filter(p => p.status === 'ok').length}
              >
                {campo.pesslDevices.map(dev => (
                  <PesslRow key={dev.serial} dev={dev} />
                ))}
              </Section>
            )}

            {/* Sección Pozos DGA */}
            {campo.pozos.length > 0 && (
              <Section
                title="Pozos DGA"
                subtitle="Envío de datos a la DGA"
                accentColor="text-primary"
                count={campo.pozos.length}
                okCount={campo.pozos.filter(z => !z.hasError).length}
              >
                {campo.pozos.map(pozo => (
                  <PozoRow key={pozo.wellId} pozo={pozo} />
                ))}
              </Section>
            )}

            {/* Sin dispositivos */}
            {campo.talgilDevices.length === 0 && campo.pesslDevices.length === 0 && campo.pozos.length === 0 && (
              <p className="text-body-sm text-on-surface-variant text-center py-8">
                Sin dispositivos registrados en este campo
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title, subtitle, accentColor, count, okCount, children,
}: {
  title: string; subtitle: string; accentColor: string;
  count: number; okCount: number; children: React.ReactNode;
}) {
  const allOk = okCount === count;
  return (
    <div className="space-y-2">
      {/* Encabezado de sección */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className={`text-title-sm font-semibold uppercase tracking-label font-display ${accentColor}`}>
            {title}
          </span>
          <span className="ml-2 text-body-sm text-on-surface-variant">{subtitle}</span>
        </div>
        <span className={`text-label-sm font-semibold tabular-nums ${allOk ? 'text-secondary' : 'text-tertiary'}`}>
          {okCount}/{count} ok
        </span>
      </div>
      {/* Cards de dispositivos */}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

// ── TalgilRow ─────────────────────────────────────────────────────────────────

function TalgilRow({ dev }: { dev: TalgilSalud }) {
  const st  = STATUS_STYLE[dev.status];
  const pct = Math.round(dev.score * 100);
  const [rtuOpen, setRtuOpen] = useState(false);
  const hasRtuDetail = (dev.rtus?.problemRtus?.length ?? 0) > 0;

  return (
    <div className="bg-surface-container-low rounded-sm p-3.5 space-y-2.5">

      {/* Nombre + estado + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${st.dot}`} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-title-sm font-semibold text-on-surface">
              {dev.name}
            </p>
            <p className="text-body-sm text-on-surface-variant font-mono mt-0.5">
              #{dev.serial}
            </p>
          </div>
        </div>
        <span className={`font-display text-headline-sm font-bold tabular-nums leading-none shrink-0 ${st.text}`}>
          {pct}%
        </span>
      </div>

      {/* Barra de score */}
      <div className="h-0.5 rounded-full bg-surface-container-highest overflow-hidden">
        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2">
        <Metric
          label="Última com."
          prefix="hace"
          value={dev.hoursSinceComm !== null ? formatHoursShort(dev.hoursSinceComm) : 'sin fecha'}
          alert={dev.hoursSinceComm === null || dev.hoursSinceComm > 24}
          warn={dev.hoursSinceComm !== null && dev.hoursSinceComm > 3 && dev.hoursSinceComm <= 24}
        />
        <Metric
          label="Batería"
          value={dev.batteryPct !== null && dev.batteryPct > 0 ? `${dev.batteryPct.toFixed(1)}%` : '—'}
          alert={dev.batteryPct !== null && dev.batteryPct > 0 && dev.batteryPct < 20}
          warn={dev.batteryPct !== null && dev.batteryPct > 0 && dev.batteryPct >= 20 && dev.batteryPct < 50}
        />
        <Metric
          label="RTUs"
          value={dev.rtus ? `${dev.rtus.ok}/${dev.rtus.total}` : '—'}
          alert={dev.rtus !== null && dev.rtus.errors > 0}
          warn={dev.rtus !== null && dev.rtus.alerts > 0 && dev.rtus.errors === 0}
        />
      </div>

      {/* Detalle RTU errores/alertas — expandible */}
      {dev.rtus && (dev.rtus.errors > 0 || dev.rtus.alerts > 0) && (
        <div className="space-y-1.5">
          <button
            onClick={() => hasRtuDetail && setRtuOpen((o: boolean) => !o)}
            className={`flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-sm bg-surface-container transition-colors ${
              hasRtuDetail ? 'cursor-pointer active:bg-surface-container-high' : 'cursor-default'
            }`}
          >
            <div className="flex gap-2 flex-wrap flex-1 items-center">
              {/* Círculo con cantidad — rojo si hay errores, amarillo si solo alertas */}
              {(dev.rtus.errors || 0) > 0 ? (
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-display text-label-sm font-bold shrink-0 bg-error text-on-error">
                  {dev.rtus.errors}
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-display text-label-sm font-bold shrink-0 bg-tertiary text-on-tertiary">
                  {dev.rtus.alerts}
                </span>
              )}
              <span className="font-display text-body-md font-semibold text-on-surface">
                RTU con problemas
              </span>
            </div>
            {hasRtuDetail && (
              <svg
                className={`w-4 h-4 text-on-surface-variant shrink-0 transition-transform ${rtuOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Lista de RTUs con problemas — cada una es expandible al tap */}
          {rtuOpen && hasRtuDetail && (
            <div className="bg-surface-container rounded-sm overflow-hidden divide-y divide-outline-variant/10">
              {dev.rtus.problemRtus.map((r, i) => (
                <RtuDetailRow key={i} rtu={r} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ── RtuDetailRow ─────────────────────────────────────────────────────────────────

type ProblemRtu = { name: string; uid: string; stateLabel: string; state: number; _id: string };

function RtuDetailRow({ rtu }: { rtu: ProblemRtu }) {
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [chartData, setChartData] = useState<{ date: string; state: number }[] | null>(null);

  // state 1-2 = error, 3+ = warning
  const isError      = rtu.state === 1 || rtu.state === 2;

  const hasChart = !!rtu._id;

  const handleTap = async () => {
    if (!hasChart) return;
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (chartData !== null) return; // already fetched
    setLoading(true);
    const data = await getRtuDetailsAction(rtu._id);
    setChartData(data);
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleTap}
        className={`flex items-center justify-between w-full px-3 py-2.5 gap-2 text-left transition-colors ${
          hasChart ? 'active:bg-surface-container-highest cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-title-sm font-semibold text-on-surface truncate">{rtu.name}</p>
          {rtu.uid && <p className="text-body-sm text-on-surface-variant font-mono mt-0.5">{rtu.uid}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-label-sm px-2 py-0.5 rounded-sm font-semibold"
            style={isError
              ? { color: 'var(--color-error)', background: 'var(--color-error-container)' }
              : { color: '#111', background: '#facc15' }
            }
          >
            {rtu.stateLabel}
          </span>
          {hasChart && (
            <svg
              className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {open && hasChart && (
        <div className="px-3 pb-3">
          {loading && (
            <div className="h-28 bg-surface-container-highest rounded-sm animate-pulse" />
          )}
          {!loading && chartData !== null && chartData.length === 0 && (
            <p className="text-label-sm text-on-surface-variant text-center py-4">
              Sin historial disponible
            </p>
          )}
          {!loading && chartData && chartData.length > 0 && (
            <RtuHistoryChart data={chartData} currentState={rtu.state} />
          )}
        </div>
      )}
    </div>
  );
}

// ── RtuHistoryChart (SVG puro, sin dependencias) ────────────────────────────────

const RTU_STATE_DESC: Record<number, string> = {
  0: 'OK', 1: 'Error interfaz', 2: 'Error comunicación',
  3: 'Bat. baja', 4: 'En prueba', 5: 'Sin conexión',
};

function RtuHistoryChart({
  data, currentState,
}: { data: { date: string; state: number }[]; currentState: number }) {
  const W = 320, H = 120;
  const PAD = { top: 8, right: 8, bottom: 20, left: 26 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  const toY = (s: number) => PAD.top  + cH - (s / 5) * cH;
  const toX = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * cW;

  // Background zones matching plataforma-soporte reference areas
  const zones = [
    { y1: 0,   y2: 0.5, fill: '#c3f400', opacity: 0.15 },  // OK
    { y1: 4.5, y2: 5,   fill: '#c3f400', opacity: 0.15 },  // state 5
    { y1: 0.5, y2: 2.5, fill: '#ffb4ab', opacity: 0.18 },  // error
    { y1: 2.5, y2: 4.5, fill: '#ffb59a', opacity: 0.18 },  // warning
  ];

  const lineColor =
    currentState === 0 || currentState === 5 ? '#c3f400'
    : currentState <= 2                      ? '#ffb4ab'
    :                                          '#ffb59a';

  const points = data.map((d, i) => `${toX(i)},${toY(d.state)}`).join(' ');

  const firstDate = data[0]?.date?.slice(5, 10)  ?? '';
  const lastDate  = data[data.length - 1]?.date?.slice(5, 10) ?? '';

  return (
    <div className="space-y-1.5">
      {/* Leyenda de zonas */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {[
          { label: '0 — OK',            color: 'bg-secondary/30' },
          { label: '1-2 — Error',        color: 'bg-error/30'     },
          { label: '3-4 — Alerta',       color: 'bg-tertiary/30'  },
          { label: '5 — Sin conexión',   color: 'bg-secondary/20' },
        ].map(z => (
          <div key={z.label} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-sm ${z.color}`} />
            <span className="text-label-sm text-on-surface-variant">{z.label}</span>
          </div>
        ))}
      </div>

      {/* Gráfico SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 120 }}
        aria-label="Historial de estado RTU"
      >
        {/* Zonas de fondo */}
        {zones.map((z, i) => (
          <rect
            key={i}
            x={PAD.left}
            y={toY(z.y2)}
            width={cW}
            height={Math.max(toY(z.y1) - toY(z.y2), 0)}
            fill={z.fill}
            fillOpacity={z.opacity}
          />
        ))}

        {/* Grid Y */}
        {[0, 1, 2, 3, 4, 5].map(v => (
          <g key={v}>
            <line
              x1={PAD.left} y1={toY(v)} x2={PAD.left + cW} y2={toY(v)}
              stroke="#7fa8b0" strokeOpacity={0.12} strokeWidth={0.5}
            />
            <text x={PAD.left - 3} y={toY(v) + 3} fontSize={7} fill="#7fa8b0" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Línea de estado */}
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Etiquetas X */}
        <text x={PAD.left}            y={H - 4} fontSize={8} fill="#7fa8b0" textAnchor="start">{firstDate}</text>
        <text x={PAD.left + cW}       y={H - 4} fontSize={8} fill="#7fa8b0" textAnchor="end">{lastDate}</text>
      </svg>

      {/* Estado actual */}
      <p className="text-label-sm text-on-surface-variant">
        Último estado: <span className="font-semibold text-on-surface">
          {data[data.length - 1]?.state ?? '—'} — {RTU_STATE_DESC[data[data.length - 1]?.state] ?? '?'}
        </span>
      </p>
    </div>
  );
}

// ── PesslRow ──────────────────────────────────────────────────────────────────

function PesslRow({ dev }: { dev: PesslSalud }) {
  const st  = STATUS_STYLE[dev.status];
  const pct = Math.round(dev.score * 100);

  return (
    <div className="bg-surface-container-low rounded-sm p-3.5 space-y-2.5">

      {/* Nombre + serial + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${st.dot}`} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-title-sm font-semibold text-on-surface">
              {dev.name}
            </p>
            <p className="text-body-sm text-on-surface-variant font-mono mt-0.5">
              #{dev.serial}
            </p>
          </div>
        </div>
        <span className={`font-display text-headline-sm font-bold tabular-nums leading-none shrink-0 ${st.text}`}>
          {pct}%
        </span>
      </div>

      {/* Barra */}
      <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Última comunicación */}
      <div className="grid grid-cols-2 gap-2">
        <Metric
          label="Última com."
          prefix="hace"
          value={dev.hoursSinceComm !== null ? formatHoursShort(dev.hoursSinceComm) : 'sin fecha'}
          alert={dev.hoursSinceComm === null || dev.hoursSinceComm > 24}
          warn={dev.hoursSinceComm !== null && dev.hoursSinceComm > 3 && dev.hoursSinceComm <= 24}
        />
        <Metric
          label="Estado"
          value={st.label}
          alert={dev.status === 'critical'}
          warn={dev.status === 'warning'}
        />
      </div>

      {dev.problems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dev.problems.map((p, i) => (
            <ProblemTag key={i} text={p} type={dev.status} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PozoRow ───────────────────────────────────────────────────────────────────

function PozoRow({ pozo }: { pozo: PozoSalud }) {
  const isInfo = pozo.hasWarning && !pozo.hasError;
  const status: HealthStatus = pozo.hasError ? 'critical' : isInfo ? 'warning' : 'ok';
  const st = STATUS_STYLE[status];

  return (
    <div className="bg-surface-container-low rounded-sm p-3.5 space-y-2">

      {/* Nombre + estado */}
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
        <span className="flex-1 font-display text-body-md font-semibold text-on-surface truncate">
          {pozo.name}
        </span>
        <span className={`font-display text-label-md font-semibold shrink-0 ${st.text}`}>
          {pozo.hasError ? 'Error DGA' : isInfo ? 'Sin envío DGA' : 'Enviando'}
        </span>
      </div>

      {/* Métricas */}
      <div className="flex gap-3 flex-wrap">
        <Metric
          label="Envío DGA"
          value={pozo.sendtodga ? 'Sí' : 'No'}
          warn={!pozo.sendtodga && isInfo}
        />
        {pozo.pendingData !== null && pozo.pendingData > 0 && (
          <Metric
            label="Datos pendientes"
            value={`${pozo.pendingData}`}
            alert={pozo.hasError}
            warn={!pozo.hasError && pozo.pendingData > 0}
          />
        )}
      </div>

      {/* Etiqueta informacional */}
      {isInfo && (
        <p className="text-label-sm text-tertiary">
          ℹ Este pozo no envía a la DGA por decisión del cliente — no afecta la salud del campo
        </p>
      )}

      {pozo.problems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pozo.problems.map((p, i) => (
            <ProblemTag key={i} text={p} type="critical" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Metric ────────────────────────────────────────────────────────────────────

function Metric({
  label, value, prefix, alert = false, warn = false,
}: { label: string; value: string; prefix?: string; alert?: boolean; warn?: boolean }) {
  const valueColor = alert ? 'text-error' : warn ? 'text-tertiary' : 'text-on-surface';
  return (
    <div className="bg-surface-container rounded-sm px-3 py-2.5 flex-1 min-w-0">
      <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-label font-display">
        {label}
      </p>
      {prefix && (
        <p className="font-display text-label-sm text-on-surface-variant leading-none mb-0.5">
          {prefix}
        </p>
      )}
      <p className={`font-display text-title-md font-bold tabular-nums truncate ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

// ── ProblemTag ────────────────────────────────────────────────────────────────

function ProblemTag({ text, type }: { text: string; type: HealthStatus | 'critical' }) {
  const cls =
    type === 'critical'
      ? 'text-error bg-error-container'
      : 'text-tertiary bg-tertiary-container';
  return (
    <span className={`text-label-sm px-2 py-0.5 rounded-sm ${cls}`}>{text}</span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonDetalle() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low rounded-sm h-20 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-surface-container rounded-sm animate-pulse" />
        {[80, 100, 90].map((h, i) => (
          <div key={i} className="bg-surface-container-low rounded-sm animate-pulse" style={{ height: `${h}px`, opacity: 1 - i * 0.2 }} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-surface-container rounded-sm animate-pulse" />
        <div className="bg-surface-container-low rounded-sm h-24 animate-pulse opacity-70" />
      </div>
    </div>
  );
}
