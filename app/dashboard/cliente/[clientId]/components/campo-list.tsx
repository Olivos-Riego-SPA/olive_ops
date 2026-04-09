'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LuSprout } from 'react-icons/lu';
import { useMonitorData } from '@/hooks/use-monitor-data';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useSwipeBack } from '@/hooks/use-swipe-back';
import { useSmartBack } from '@/hooks/use-smart-back';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';
import { PullIndicator } from '@/components/pull-indicator';
import { SwipeBackIndicator } from '@/components/swipe-back-indicator';
import { buildClientSaludList, formatHours, scoreToStatus } from '@/lib/calc-client-salud';
import type { CampoSalud, HealthStatus } from '@/types/client-salud';

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<HealthStatus, { dot: string; bar: string; text: string; label: string }> = {
  ok      : { dot: 'bg-secondary',  bar: 'bg-secondary',  text: 'text-secondary',  label: 'OK'      },
  warning : { dot: 'bg-tertiary',   bar: 'bg-tertiary',   text: 'text-tertiary',   label: 'Alerta'  },
  critical: { dot: 'bg-error',      bar: 'bg-error',      text: 'text-error',      label: 'Crítico' },
};

// ── CampoList ─────────────────────────────────────────────────────────────────

export default function CampoList({ clientId }: { clientId: string }) {
  const [search, setSearch] = useState('');
  const { track } = useSessionScan();

  const monitor = useMonitorData();
  const { pullY, refreshing } = usePullToRefresh(() => {
    track(OPS.clientFieldsRefresh());
    return monitor.refetchAll();
  });
  const goBack = useSmartBack('/dashboard');
  const swipeBack = useSwipeBack(goBack);

  const isLoading =
    monitor.talgilConns.isLoading  ||
    monitor.batteryList.isLoading  ||
    monitor.rtuList.isLoading      ||
    monitor.pesslDevices.isLoading ||
    monitor.wellStatus.isLoading   ||
    monitor.countrysides.isLoading;

  const client = useMemo(() => {
    if (isLoading) return null;
    const list = buildClientSaludList({
      talgilConns : monitor.talgilConns.data,
      batteryList : monitor.batteryList.data  ?? [],
      rtuList     : monitor.rtuList.data      ?? [],
      pesslDevices: monitor.pesslDevices.data ?? [],
      wellStatus  : monitor.wellStatus.data   ?? [],
      countrysides: monitor.countrysides.data ?? [],
    });
    return list.find(c => c.clientId === clientId) ?? null;
  }, [
    monitor.talgilConns.data,
    monitor.batteryList.data,
    monitor.rtuList.data,
    monitor.pesslDevices.data,
    monitor.wellStatus.data,
    monitor.countrysides.data,
    clientId,
    isLoading,
  ]);

  // Track page view
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || !client) return;
    tracked.current = true;
    track(OPS.clientFieldsView({ entityId: clientId, entityName: client.clientName }));
  }, [client, clientId, track]);

  // Track search with debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!search.trim()) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      track(OPS.clientFieldsSearch({ metadata: { query: search.trim() } }));
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search, track]);

  // Campos ordenados: críticos → alertas → ok, dentro del grupo por score asc
  const campos = useMemo(() => {
    if (!client) return [];
    const STATUS_ORDER: Record<HealthStatus, number> = { critical: 0, warning: 1, ok: 2 };
    const q = search.trim().toLowerCase();
    return [...client.campos]
      .filter(c => !q || c.campoName.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return diff !== 0 ? diff : a.score - b.score;
      });
  }, [client, search]);

  const globalSt = client ? STATUS_STYLE[client.globalStatus] : null;

  const category = useMemo(() => {
    for (const c of (monitor.clients.data ?? []) as any[]) {
      if (c._id === clientId) return c.category as string | undefined;
    }
    return undefined;
  }, [monitor.clients.data, clientId]);

  const CATEGORY_CONFIG: Record<string, { label: string; text: string }> = {
    'Outlier Positivo': { label: 'OP', text: 'text-secondary'          },
    'Q1'              : { label: 'Q1', text: 'text-primary'            },
    'Q2'              : { label: 'Q2', text: 'text-primary'            },
    'Q3'              : { label: 'Q3', text: 'text-tertiary'           },
    'Q4'              : { label: 'Q4', text: 'text-tertiary'           },
    'Q5'              : { label: 'Q5', text: 'text-error'              },
    'Outlier Negativo': { label: 'ON', text: 'text-on-surface-variant' },
  };

  return (
    <main className="min-h-screen bg-surface">
      <PullIndicator pullY={pullY} refreshing={refreshing || monitor.isRefetching} />
      <SwipeBackIndicator {...swipeBack} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Botón volver */}
        <button
          onClick={() => { track(OPS.clientFieldsBack()); goBack(); }}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Volver"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-label-lg">Volver</span>
        </button>

        {/* Header Paso 2 */}
        <div>
          <p className="font-display text-label-lg uppercase tracking-label text-secondary mb-2">
            Paso 2
          </p>
          <h2 className="font-display text-display-md font-semibold text-on-surface leading-tight tracking-display">
            Estado de<br />
            <span className="text-secondary italic">Campos</span>
          </h2>
          <div className="flex gap-2 mt-4 mb-3">
            <span className="h-1 w-16 rounded-full bg-secondary" />
            <span className="h-1 w-16 rounded-full bg-secondary" />
            <span className="h-1 w-16 rounded-full bg-surface-container-highest" />
          </div>
          <p className="font-display text-body-md text-on-surface-variant">
            Seleccione un campo para ver el detalle de dispositivos
          </p>
        </div>

        {/* Resumen del cliente */}
        {isLoading && (
          <div className="bg-surface-container-low rounded-sm p-4 animate-pulse h-24" />
        )}
        {!isLoading && client && globalSt && (
          <div className="bg-surface-container-low rounded-sm p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Izquierda: nombre + categoría + chips */}
              <div className="flex-1 min-w-0 space-y-2">
                <h1 className="font-display text-title-lg font-bold text-on-surface">
                  {client.clientName}
                </h1>
                {category && CATEGORY_CONFIG[category] && (
                  <p className={`font-display text-label-sm ${CATEGORY_CONFIG[category].text}`}>
                    {CATEGORY_CONFIG[category].label} · {category}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {client.hasTalgil && (
                    <TechSummaryChip label="Talgil" count={client.talgilCount} score={client.talgilScore} />
                  )}
                  {client.hasPessl && (
                    <TechSummaryChip label="Pessl" count={client.pesslCount} score={client.pesslScore} />
                  )}
                  {client.hasPozos && (
                    <TechSummaryChip label="Pozos DGA" count={client.pozosCount} score={client.pozosScore} />
                  )}
                </div>
              </div>

              {/* Derecha: score + imprimir */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`font-display text-display-md font-bold tabular-nums leading-none ${globalSt.text}`}>
                  {client.globalScore}%
                </span>
                <Link
                  href={`/dashboard/cliente/${clientId}/imprimir`}
                  onClick={() => track(OPS.clientFieldsPrint({ entityId: clientId }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-display text-label-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671L17.25 19.5m0 0l.345-5.71m0 0a41.956 41.956 0 00-10.59 0M3 7.5h18M3 7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h18A2.25 2.25 0 0023.25 18.75v-9A2.25 2.25 0 0021 7.5M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5" />
                  </svg>
                  Ficha cliente
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !client && (
          <div className="py-16 text-center space-y-2">
            <p className="text-body-md text-on-surface-variant">Cliente no encontrado</p>
            <button onClick={() => { track(OPS.clientFieldsBack()); goBack(); }} className="text-label-md text-primary underline">
              Volver al listado
            </button>
          </div>
        )}

        {/* Skeletons campos */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-sm animate-pulse"
                style={{ height: '96px', opacity: 1 - i * 0.18 }}
              />
            ))}
          </div>
        )}

        {/* Separador campos */}
        <div className="flex items-center gap-3 pt-1">
          <span className="font-display text-label-sm uppercase tracking-label text-on-surface-variant">Campos</span>
          <div className="flex-1 h-px bg-outline-variant" />
          {!isLoading && client && (
            <span className="font-display text-label-sm text-on-surface-variant">{campos.length}</span>
          )}
        </div>

        {/* Buscador de campos */}
        <div className="relative flex items-center">
          <svg
            className="absolute left-3.5 w-4 h-4 text-on-surface-variant pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar campo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-sm text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-high transition-colors"
          />
        </div>

        {/* Lista de campos */}
        {!isLoading && client && (
          <div className="space-y-3">
            {campos.map(campo => (
              <CampoCard key={campo.campoId} campo={campo} clientId={clientId} onSelect={track} />
            ))}
            {campos.length === 0 && search && (
              <div className="py-12 text-center">
                <p className="text-body-md text-on-surface-variant">
                  Sin resultados para &ldquo;{search}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

// ── TechSummaryChip ───────────────────────────────────────────────────────────

function TechSummaryChip({ label, count, score }: { label: string; count: number; score: number | null }) {
  const pct = score !== null ? Math.round(score * 100) : null;
  const st  = pct !== null ? scoreToStatus(pct / 100) : null;
  const colorClass =
    st === 'ok'       ? 'text-secondary border-secondary/30'
    : st === 'warning'  ? 'text-tertiary border-tertiary/30'
    : st === 'critical' ? 'text-error border-error/30'
    : 'text-on-surface-variant border-outline-variant';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border bg-surface-container-low text-label-sm ${colorClass}`}>
      <span>{label}</span>
      <span className="opacity-60">·</span>
      <span className="font-semibold">{count}</span>
      {pct !== null && (
        <>
          <span className="opacity-60">·</span>
          <span className="font-semibold tabular-nums">{pct}%</span>
        </>
      )}
    </div>
  );
}

// ── CampoCard ─────────────────────────────────────────────────────────────────

function CampoCard({ campo, clientId, onSelect }: { campo: CampoSalud; clientId: string; onSelect: (event: import('@/types/session-scan').SessionScanEvent) => void }) {
  const st  = STATUS_STYLE[campo.status];
  const pct = Math.round(campo.score * 100);

  const talgilOk = campo.talgilDevices.filter(t => t.status === 'ok').length;
  const pesslOk  = campo.pesslDevices.filter(p => p.status === 'ok').length;
  const pozosErr = campo.pozos.filter(z => z.hasError).length;

  return (
    <Link
      href={`/dashboard/cliente/${clientId}/campo/${campo.campoId}`}
      onClick={() => onSelect(OPS.clientFieldsSelectCampo({ entityId: campo.campoId, entityName: campo.campoName }))}
      className="block bg-surface-container-low rounded-sm p-4 active:bg-surface-container transition-colors"
    >
      {/* Fila superior: icono + nombre + chevron */}
      <div className="flex items-center gap-2.5">
        <span className={`shrink-0 ${st.text}`}>
          <LuSprout size={16} />
        </span>
        <span className="flex-1 font-display text-title-sm font-semibold text-on-surface truncate">
          {campo.campoName}
        </span>
        <svg className="w-4 h-4 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Barra de salud */}
      <div className="mt-2.5 h-1 rounded-full bg-surface-container-highest overflow-hidden">
        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Dispositivos (izq) | score grande (der) */}
      <div className="mt-2.5 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          {campo.talgilDevices.length > 0 && (
            <DeviceCount
              label="Talgil"
              ok={talgilOk}
              total={campo.talgilDevices.length}
              lastComm={campo.talgilDevices.map(t => t.hoursSinceComm).sort((a, b) => (a ?? 9999) - (b ?? 9999))[0]}
            />
          )}
          {campo.pesslDevices.length > 0 && (
            <DeviceCount
              label="Pessl"
              ok={pesslOk}
              total={campo.pesslDevices.length}
              lastComm={campo.pesslDevices.map(p => p.hoursSinceComm).sort((a, b) => (a ?? 9999) - (b ?? 9999))[0]}
            />
          )}
          {campo.pozos.length > 0 && (
            <PozosCount
              total={campo.pozos.length}
              errors={pozosErr}
              warnings={campo.pozos.filter(z => z.hasWarning && !z.hasError).length}
            />
          )}
        </div>
        <span className={`font-display text-display-md font-bold tabular-nums leading-none shrink-0 ${st.text}`}>
          {pct}%
        </span>
      </div>

      {/* Top problems */}
      {campo.status !== 'ok' && campo.topProblems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {campo.topProblems.slice(0, 2).map((p, i) => (
            <span key={i} className="text-label-sm text-error bg-error-container px-2 py-0.5 rounded-sm">
              {p}
            </span>
          ))}
          {campo.topProblems.length > 2 && (
            <span className="text-label-sm text-on-surface-variant px-1 py-0.5">
              +{campo.topProblems.length - 2} más
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ── DeviceCount ───────────────────────────────────────────────────────────────

function DeviceCount({
  label, ok, total, lastComm,
}: { label: string; ok: number; total: number; lastComm: number | null | undefined }) {
  const allOk = ok === total;
  return (
    <span className={`text-label-sm px-2 py-0.5 rounded-sm bg-surface-container ${allOk ? 'text-secondary' : 'text-tertiary'}`}>
      {label} {ok}/{total}
      {lastComm !== undefined && lastComm !== null && (
        <span className="opacity-60 ml-1">· {formatHours(lastComm)}</span>
      )}
    </span>
  );
}

// ── PozosCount ────────────────────────────────────────────────────────────────

function PozosCount({ total, errors, warnings }: { total: number; errors: number; warnings: number }) {
  const colorClass = errors > 0 ? 'text-error' : warnings > 0 ? 'text-tertiary' : 'text-secondary';
  return (
    <span className={`text-label-sm px-2 py-0.5 rounded-sm bg-surface-container ${colorClass}`}>
      Pozos {total - errors}/{total}
      {errors > 0 && <span className="ml-1 opacity-80">· {errors} error{errors > 1 ? 'es' : ''}</span>}
    </span>
  );
}
