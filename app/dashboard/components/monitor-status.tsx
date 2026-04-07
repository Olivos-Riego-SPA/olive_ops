'use client';

import { useMonitorData } from '@/hooks/use-monitor-data';
import { useSessionScan } from '@/hooks/use-session-scan';
import { OPS } from '@/lib/scan-events';

export default function MonitorStatus() {
  const { track } = useSessionScan();
  const {
    talgilConns,
    pesslConns,
    batteryList,
    rtuList,
    wellStatus,
    pesslDevices,
    wellDevices,
    countrysides,
    clients,
    refetchAll,
    isLoading,
    isRefetching,
  } = useMonitorData();

  return (
    <div className="space-y-6">
      {/* Header con estado global */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-label text-secondary font-display mb-1">
            Monitor de Dispositivos
          </p>
          {(isLoading || isRefetching) && (
            <div className="flex items-center gap-2">
              <div className="orb-ok animate-pulse" />
              <span className="text-label-sm text-on-surface-variant">
                {isLoading ? 'Cargando datos...' : 'Actualizando...'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => { track(OPS.monitorRefresh()); refetchAll(); }}
          disabled={isLoading || isRefetching}
          className="px-4 py-1.5 rounded-sm border border-outline-variant text-label-md font-display uppercase tracking-label text-on-surface-variant hover:border-primary hover:text-primary transition-colors duration-(--duration-fast) disabled:opacity-40"
        >
          Refrescar
        </button>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Talgil"
          value={talgilConns.data ? countTalgilOnline(talgilConns.data) : null}
          suffix="online"
          loading={talgilConns.isLoading}
        />
        <MetricCard
          label="Pessl"
          value={pesslConns.data ? countPesslOnline(pesslConns.data) : null}
          suffix="online"
          loading={pesslConns.isLoading}
        />
        <MetricCard
          label="RTUs"
          value={rtuList.data?.length ?? null}
          suffix="registradas"
          loading={rtuList.isLoading}
        />
        <MetricCard
          label="Pozos DGA"
          value={wellDevices.data?.length ?? null}
          suffix="registrados"
          loading={wellDevices.isLoading}
        />
        <MetricCard
          label="Estaciones Pessl"
          value={pesslDevices.data?.length ?? null}
          suffix="registradas"
          loading={pesslDevices.isLoading}
        />
        <MetricCard
          label="Campos"
          value={countrysides.data?.length ?? null}
          suffix="campos"
          loading={countrysides.isLoading}
        />
        <MetricCard
          label="Clientes"
          value={clients.data?.length ?? null}
          suffix="activos"
          loading={clients.isLoading}
        />
        <MetricCard
          label="Batería"
          value={batteryList.data?.length ?? null}
          suffix="dispositivos"
          loading={batteryList.isLoading}
        />
        <MetricCard
          label="Alertas DGA"
          value={wellStatus.data ? countWellErrors(wellStatus.data) : null}
          suffix="alertas"
          loading={wellStatus.isLoading}
          alert={wellStatus.data ? countWellErrors(wellStatus.data) > 0 : false}
        />
      </div>
    </div>
  );
}

// ── Helpers de conteo ────────────────────────────────────────────────────────

function countTalgilOnline(data: any): number {
  const online = data?.stationsLessThan1Hour ?? [];
  const recent = data?.stationsBetween1And3Hours ?? [];
  return online.length + recent.length;
}

function countPesslOnline(data: any): number {
  const online = data?.stationsLessThan1Hour ?? [];
  const recent = data?.stationsBetween1And3Hours ?? [];
  return online.length + recent.length;
}

function countWellErrors(data: any[]): number {
  return data.filter((group: any) => group.code !== '0' && group.code !== '1').length;
}

// ── Componente de métrica ────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  suffix,
  loading,
  alert = false,
}: {
  label: string;
  value: number | null;
  suffix: string;
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`bg-surface-container-low rounded-sm p-4 ${alert ? 'card-active border-l-[var(--color-tertiary)]' : 'card-active'}`}>
      <p className="text-label-sm uppercase tracking-label text-on-surface-variant font-display mb-2">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-12 bg-surface-container-high rounded-sm animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-display text-headline-sm font-semibold tracking-display ${
              alert ? 'text-tertiary' : 'text-on-surface'
            }`}
          >
            {value ?? '—'}
          </span>
          <span className="text-label-sm text-on-surface-variant">{suffix}</span>
        </div>
      )}
    </div>
  );
}
