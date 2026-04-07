'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LuBuilding2 } from 'react-icons/lu';
import { useMonitorData } from '@/hooks/use-monitor-data';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';
import { PullIndicator } from '@/components/pull-indicator';
import { buildClientSaludList } from '@/lib/calc-client-salud';
import type { ClientSalud, HealthStatus } from '@/types/client-salud';

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<HealthStatus, { dot: string; bar: string; text: string; label: string }> = {
  ok      : { dot: 'bg-secondary',  bar: 'bg-secondary',  text: 'text-secondary',  label: 'OK'      },
  warning : { dot: 'bg-tertiary',   bar: 'bg-tertiary',   text: 'text-tertiary',   label: 'Alerta'  },
  critical: { dot: 'bg-error',      bar: 'bg-error',      text: 'text-error',      label: 'Crítico' },
};

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; text: string; chip: string; chipActive: string }> = {
  'Outlier Positivo': { label: 'OP', text: 'text-secondary',          chip: 'text-secondary border-secondary/40',          chipActive: 'bg-secondary text-on-secondary border-secondary'          },
  'Q1'              : { label: 'Q1', text: 'text-primary',            chip: 'text-primary border-primary/40',              chipActive: 'bg-primary text-on-primary border-primary'              },
  'Q2'              : { label: 'Q2', text: 'text-primary',            chip: 'text-primary border-primary/40',              chipActive: 'bg-primary text-on-primary border-primary'              },
  'Q3'              : { label: 'Q3', text: 'text-tertiary',           chip: 'text-tertiary border-tertiary/40',            chipActive: 'bg-tertiary text-on-tertiary border-tertiary'           },
  'Q4'              : { label: 'Q4', text: 'text-tertiary',           chip: 'text-tertiary border-tertiary/40',            chipActive: 'bg-tertiary text-on-tertiary border-tertiary'           },
  'Q5'              : { label: 'Q5', text: 'text-error',              chip: 'text-error border-error/40',                  chipActive: 'bg-error text-on-error border-error'                  },
  'Outlier Negativo': { label: 'ON', text: 'text-on-surface-variant', chip: 'text-on-surface-variant border-outline/40',   chipActive: 'bg-surface-container-highest text-on-surface border-outline' },
};

const CATEGORY_RANK: Record<string, number> = {
  'Outlier Positivo': 0,
  'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4, 'Q5': 5,
  'Outlier Negativo': 6,
};

const CATEGORY_ORDER = ['Outlier Positivo', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Outlier Negativo'] as const;

// ── ClientHealthList ───────────────────────────────────────────────────────────

export default function ClientHealthList() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'category'>('score');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const { track } = useSessionScan();

  const monitor = useMonitorData();
  const { pullY, refreshing } = usePullToRefresh(() => {
    track(OPS.healthRefresh());
    return monitor.refetchAll();
  });

  // Track page view
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track(OPS.healthView());
  }, [track]);

  // Track search with debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!search.trim()) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      track(OPS.healthSearch({ metadata: { query: search.trim() } }));
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search, track]);

  const isLoading =
    monitor.talgilConns.isLoading ||
    monitor.batteryList.isLoading ||
    monitor.rtuList.isLoading     ||
    monitor.pesslDevices.isLoading ||
    monitor.wellStatus.isLoading  ||
    monitor.countrysides.isLoading ||
    monitor.clients.isLoading;

  const categoryMap = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const c of (monitor.clients.data ?? []) as any[]) {
      if (c._id && c.category) map.set(c._id, c.category);
    }
    return map;
  }, [monitor.clients.data]);

  const allClients = useMemo<ClientSalud[]>(() => {
    if (isLoading) return [];
    return buildClientSaludList({
      talgilConns : monitor.talgilConns.data,
      batteryList : monitor.batteryList.data  ?? [],
      rtuList     : monitor.rtuList.data      ?? [],
      pesslDevices: monitor.pesslDevices.data ?? [],
      wellStatus  : monitor.wellStatus.data   ?? [],
      countrysides: monitor.countrysides.data ?? [],
    });
  }, [
    monitor.talgilConns.data,
    monitor.batteryList.data,
    monitor.rtuList.data,
    monitor.pesslDevices.data,
    monitor.wellStatus.data,
    monitor.countrysides.data,
    isLoading,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q ? allClients.filter(c => c.clientName.toLowerCase().includes(q)) : [...allClients];

    if (selectedCategories.size > 0) {
      list = list.filter(c => {
        const cat = categoryMap.get(c.clientId) ?? '';
        return selectedCategories.has(cat === '' ? '__none__' : cat);
      });
    }

    if (sortBy === 'score') {
      list.sort((a, b) => a.globalScore - b.globalScore);
    } else {
      list.sort((a, b) => {
        const ra = CATEGORY_RANK[categoryMap.get(a.clientId) ?? ''] ?? 99;
        const rb = CATEGORY_RANK[categoryMap.get(b.clientId) ?? ''] ?? 99;
        return ra !== rb ? ra - rb : a.globalScore - b.globalScore;
      });
    }
    return list;
  }, [allClients, search, sortBy, categoryMap, selectedCategories]);

  const criticalCount = allClients.filter(c => c.globalStatus === 'critical').length;
  const warningCount  = allClients.filter(c => c.globalStatus === 'warning').length;
  const okCount       = allClients.filter(c => c.globalStatus === 'ok').length;

  return (
    <div className="space-y-5">

      <PullIndicator pullY={pullY} refreshing={refreshing || monitor.isRefetching} />

      {/* Buscador */}
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
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-sm text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-high transition-colors"
        />
      </div>

      {/* Chips de categoría */}
      {!isLoading && allClients.length > 0 && (
        <div className="flex gap-1.5">
          {CATEGORY_ORDER.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const active = selectedCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-1 font-display text-label-md py-2.5 rounded-sm border transition-colors ${
                  active ? cfg.chipActive : cfg.chip + ' bg-transparent'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          {allClients.some(c => !categoryMap.get(c.clientId)) && (
            <button
              onClick={() => toggleCategory('__none__')}
              className={`flex-1 font-display text-label-md py-2.5 rounded-sm border transition-colors ${
                selectedCategories.has('__none__')
                  ? 'bg-surface-container-highest text-on-surface border-outline'
                  : 'text-on-surface-variant border-outline/40 bg-transparent'
              }`}
            >
              —
            </button>
          )}
        </div>
      )}

      {/* Resumen de estados */}
      {!isLoading && allClients.length > 0 && (
        <div className="flex items-center gap-4">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1.5 font-display text-label-lg text-error">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1.5 font-display text-label-lg text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0" />
              {warningCount} alerta{warningCount !== 1 ? 's' : ''}
            </span>
          )}
          {okCount > 0 && (
            <span className="flex items-center gap-1.5 font-display text-label-lg text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              {okCount} ok
            </span>
          )}
        </div>
      )}

      {/* Skeleton de carga */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-sm p-4 animate-pulse"
              style={{ height: '76px', opacity: 1 - i * 0.12 }}
            />
          ))}
          <p className="text-center text-label-sm text-on-surface-variant pt-2">
            Cargando estado de clientes…
          </p>
        </div>
      )}

      {/* Ordenamiento */}
      {!isLoading && allClients.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-display text-label-sm text-on-surface-variant uppercase tracking-label mr-1">Ordenar</span>
          <button
            onClick={() => { setSortBy('score'); track(OPS.healthSort({ metadata: { sortBy: 'score' } })); }}
            className={`font-display text-label-sm px-3 py-1 rounded-sm transition-colors ${
              sortBy === 'score'
                ? 'bg-surface-container-highest text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            % Salud
          </button>
          <button
            onClick={() => { setSortBy('category'); track(OPS.healthSort({ metadata: { sortBy: 'category' } })); }}
            className={`font-display text-label-sm px-3 py-1 rounded-sm transition-colors ${
              sortBy === 'category'
                ? 'bg-surface-container-highest text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Categoría
          </button>
        </div>
      )}

      {/* Lista de clientes */}
      {!isLoading && (
        <div className="space-y-2.5">
          {filtered.map(client => (
            <ClientCard key={client.clientId} client={client} category={categoryMap.get(client.clientId)} onSelect={track} />
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-body-md text-on-surface-variant">
                {search ? `Sin resultados para "${search}"` : 'Sin datos de clientes'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ClientCard ────────────────────────────────────────────────────────────────

function ClientCard({ client, category, onSelect }: { client: ClientSalud; category?: string; onSelect: (event: import('@/types/session-scan').SessionScanEvent) => void }) {
  const st = STATUS_STYLE[client.globalStatus];

  return (
    <Link
      href={`/dashboard/cliente/${client.clientId}`}
      onClick={() => onSelect(OPS.healthSelectClient({ entityId: client.clientId, entityName: client.clientName }))}
      className="block bg-surface-container-low rounded-sm p-4 active:bg-surface-container transition-colors"
    >
      {/* Fila superior: icono + nombre */}
      <div className="flex items-center gap-2.5">
        <span className={`shrink-0 ${st.text}`}>
          <LuBuilding2 size={16} />
        </span>
        <span className="flex-1 font-display text-title-sm font-semibold text-on-surface truncate">
          {client.clientName}
        </span>
        <svg
          className="w-4 h-4 text-on-surface-variant shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Barra de salud */}
      <div className="mt-2.5 h-1 rounded-full bg-surface-container-highest overflow-hidden">
        <div
          className={`h-full rounded-full ${st.bar} transition-[width]`}
          style={{ width: `${client.globalScore}%` }}
        />
      </div>

      {/* Categoría */}
      {category && CATEGORY_CONFIG[category] && (
        <p className={`mt-1.5 font-display text-label-sm ${CATEGORY_CONFIG[category].text}`}>
          {CATEGORY_CONFIG[category].label} · {category}
        </p>
      )}

      {/* Fila inferior: dispositivos (izq) | score grande (der) */}
      <div className="mt-2.5 flex items-start justify-between gap-4">

        {/* Lista de dispositivos */}
        <div className="flex flex-col gap-0.5">
          {client.hasTalgil && (
            <TechChip label="Talgil" count={client.talgilCount} score={client.talgilScore} />
          )}
          {client.hasPessl && (
            <TechChip label="Pessl" count={client.pesslCount} score={client.pesslScore} />
          )}
          {client.hasPozos && (
            <TechChip label="Pozos" count={client.pozosCount} score={client.pozosScore} />
          )}
        </div>

        {/* Score grande */}
        <span className={`font-display text-display-md font-bold tabular-nums leading-none shrink-0 ${st.text}`}>
          {client.globalScore}%
        </span>
      </div>

      {/* Tags de problemas */}
      {client.globalStatus !== 'ok' && client.topProblems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {client.topProblems.slice(0, 2).map((problem, i) => (
            <span
              key={i}
              className="text-label-sm text-error bg-error-container px-2 py-0.5 rounded-sm"
            >
              {problem}
            </span>
          ))}
          {client.topProblems.length > 2 && (
            <span className="text-label-sm text-on-surface-variant px-1 py-0.5">
              +{client.topProblems.length - 2} más
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ── TechChip ──────────────────────────────────────────────────────────────────

function TechChip({ label, count, score }: { label: string; count: number; score: number | null }) {
  if (!count) return null;
  const pct = score !== null ? Math.round(score * 100) : null;
  const colorClass =
    pct === null ? 'text-on-surface-variant'
    : pct >= 80  ? 'text-secondary'
    : pct >= 50  ? 'text-tertiary'
    : 'text-error';

  return (
    <span className={`text-label-sm px-2 py-0.5 rounded-sm bg-surface-container ${colorClass}`}>
      {label} {count}{pct !== null ? ` · ${pct}%` : ''}
    </span>
  );
}
