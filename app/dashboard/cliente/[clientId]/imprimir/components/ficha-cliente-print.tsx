'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { buildFichaData } from '@/lib/build-ficha-data';
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

function formatDate(d: Date) {
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}
function commLabel(hours: number | null): string {
  if (hours === null) return 'Sin datos';
  if (hours < 1)  return `${(hours * 60).toFixed(0)}m`;
  return `${hours.toFixed(1)}h`;
}
function commColor(hours: number | null): string {
  if (hours === null) return 'bg-gray-400';
  if (hours < 1)   return 'bg-green-500';
  if (hours < 3)   return 'bg-green-300';
  if (hours < 24)  return 'bg-yellow-400';
  return 'bg-red-500';
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FichaClientePrint({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [ficha, setFicha]       = useState<FichaData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const generatedAt = useMemo(() => new Date(), []);

  useEffect(() => {
    buildFichaData(clientId)
      .then((data) => {
        if (!data) setError(true);
        else setFicha(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm">Preparando ficha…</p>
      </div>
    );
  }
  if (error || !ficha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">No se pudo cargar la información del cliente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── Barra de acción ── */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <span className="flex-1" />
        <p className="text-sm text-gray-400">Vista previa de impresión</p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671L17.25 19.5m0 0l.345-5.71m0 0a41.956 41.956 0 00-10.59 0M3 7.5h18M3 7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h18A2.25 2.25 0 0023.25 18.75v-9A2.25 2.25 0 0021 7.5M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5" />
          </svg>
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* ── Contenido ── */}
      <div className="ficha-print max-w-4xl mx-auto px-6 py-6 print:px-0 print:py-0">

        {/* Encabezado */}
        <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6 print:p-4 rounded-lg mb-6 print:mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl print:text-2xl font-bold mb-1">Informe Técnico de Cliente</h1>
              <p className="text-green-100 text-sm">
                Generado el {formatDate(generatedAt)} a las {formatTime(generatedAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{ficha.clientName}</p>
              <p className="text-green-100 text-sm">{ficha.campos.length} campo{ficha.campos.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Campos */}
        {ficha.campos.map((campo, i) => (
          <CampoCard key={campo._id} campo={campo} index={i} total={ficha.campos.length} />
        ))}

        {/* Pie */}
        <footer className="mt-10 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <span>Olive Ops — Informe técnico</span>
          <span>{formatDate(generatedAt)}</span>
        </footer>
      </div>
    </div>
  );
}

// ── CampoCard ─────────────────────────────────────────────────────────────────

function CampoCard({ campo, index, total }: { campo: FichaCampo; index: number; total: number }) {
  return (
    <div className="mb-8 print-avoid-break bg-white border-l-4 border-l-blue-500 shadow rounded-lg overflow-hidden">

      {/* Header del campo */}
      <div className="bg-linear-to-r from-blue-50 to-white p-4 print:p-2 border-b-2 border-blue-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 print:w-8 print:h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-lg print:text-base font-bold">{index + 1}</span>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Campo {index + 1} de {total}
              </p>
              <h2 className="text-xl print:text-base font-bold text-gray-900">{campo.name}</h2>
              <p className="text-xs text-gray-500">{campo.active ? '✓ Campo activo' : '⚠ Campo inactivo'}</p>
            </div>
          </div>
          {/* Módulos del campo */}
          <ModuleIcons campo={campo} />
        </div>

        {/* Sectores */}
        {campo.totalSector > 0 && (
          <div className="mt-3">
            <SectorBar total={campo.totalSector} kml={campo.kmlSector} />
          </div>
        )}
      </div>

      <div className="p-4 print:p-2 space-y-4">

        {/* Talgil */}
        {campo.talgilDevices.length > 0 && (
          <DeviceSection title="Controladores Talgil">
            {campo.talgilDevices.map(d => <TalgilCard key={d._id || String(d.serial)} device={d} />)}
          </DeviceSection>
        )}

        {/* Pessl */}
        {campo.pesslDevices.length > 0 && (
          <DeviceSection title="Estaciones Pessl">
            {campo.pesslDevices.map(d => <PesslCard key={d._id || d.serial} device={d} />)}
          </DeviceSection>
        )}

        {/* Davis */}
        {campo.davisDevices.length > 0 && (
          <DeviceSection title="Estaciones Davis">
            {campo.davisDevices.map(d => <DavisCard key={d._id || String(d.station_id)} device={d} />)}
          </DeviceSection>
        )}

        {/* Florapulse */}
        {campo.florapulseDevices.length > 0 && (
          <DeviceSection title="Sensores Florapulse">
            {campo.florapulseDevices.map(d => <FlorapulseCard key={d._id || d.label} device={d} />)}
          </DeviceSection>
        )}

        {/* Usuarios */}
        {campo.users.length > 0 && (
          <DeviceSection title="Usuarios del campo">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-1 font-medium pr-4">Nombre</th>
                  <th className="pb-1 font-medium pr-4">Email</th>
                  <th className="pb-1 font-medium">Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {campo.users.map(u => <UserRow key={u._id} user={u} />)}
              </tbody>
            </table>
          </DeviceSection>
        )}

        {/* Sin dispositivos */}
        {campo.talgilDevices.length === 0 &&
         campo.pesslDevices.length === 0 &&
         campo.davisDevices.length === 0 &&
         campo.florapulseDevices.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">Sin dispositivos registrados en este campo</p>
        )}
      </div>
    </div>
  );
}

// ── ModuleIcons ───────────────────────────────────────────────────────────────

function ModuleIcons({ campo }: { campo: FichaCampo }) {
  const mods = [
    { key: 'hasIrrigationModule', label: '💧 Riego' },
    { key: 'hasPlantModule',      label: '🌿 Planta' },
    { key: 'hasSoilModule',       label: '🪱 Suelo' },
    { key: 'hasWeatherModule',    label: '🌡 Clima' },
    { key: 'hasWellModule',       label: '🔩 Pozos' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {mods.map(({ key, label }) => (
        <span
          key={key}
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            campo[key]
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-50'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// ── DeviceSection ─────────────────────────────────────────────────────────────

function DeviceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <div className="space-y-2 print:space-y-1">{children}</div>
    </div>
  );
}

// ── TalgilCard ────────────────────────────────────────────────────────────────

function TalgilCard({ device: d }: { device: FichaTalgilDevice }) {
  const ok    = d.totalRtus - d.errorRtus - d.alertRtus;
  const pOk   = d.totalRtus > 0 ? ((ok / d.totalRtus) * 100).toFixed(1) : '0';
  const pAl   = d.totalRtus > 0 ? ((d.alertRtus / d.totalRtus) * 100).toFixed(1) : '0';
  const pErr  = d.totalRtus > 0 ? ((d.errorRtus / d.totalRtus) * 100).toFixed(1) : '0';

  const battColor =
    d.batteryStatus === 'Bueno'   ? 'bg-green-100 text-green-700'
    : d.batteryStatus === 'Regular' ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700';

  const modules = [
    { active: d.hasIrrigation,  label: '💧 Riego' },
    { active: d.hasWell,        label: '🔩 Pozo' },
    { active: d.hasDga,         label: '📋 DGA' },
    { active: d.hasPlantModule, label: '🌿 Planta' },
    { active: d.hasSoilModule,  label: '🪱 Suelo' },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 print:p-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{d.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold text-white ${d.isDream ? 'bg-blue-500' : 'bg-purple-500'}`}>
              {d.isDream ? 'Dream' : 'Sapir'}
            </span>
          </div>
          <span className="text-xs text-gray-500">Serial: {d.serial}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-700">Batería: {d.battery}%</span>
            <span className={`text-xs px-2 py-0.5 rounded ${battColor}`}>{d.batteryStatus}</span>
          </div>
        </div>
        {/* Módulos */}
        <div className="flex flex-wrap gap-1 justify-end">
          {modules.map(m => (
            <span
              key={m.label}
              className={`text-xs px-1.5 py-0.5 rounded border ${
                m.active
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-400 border-gray-200 opacity-40'
              }`}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Última comunicación */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-700">Última comunicación:</span>
        <span className={`px-3 py-0.5 rounded-full text-white text-xs font-semibold ${commColor(d.lastComm)}`}>
          {commLabel(d.lastComm)}
        </span>
      </div>

      {/* RTUs */}
      {d.totalRtus > 0 && (
        <div>
          <span className="text-xs font-semibold text-gray-900">RTUs (total: {d.totalRtus})</span>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex mt-1">
            {ok > 0         && <div className="h-full bg-green-400"  style={{ width: `${pOk}%` }} />}
            {d.alertRtus > 0 && <div className="h-full bg-yellow-400" style={{ width: `${pAl}%` }} />}
            {d.errorRtus > 0 && <div className="h-full bg-red-400"    style={{ width: `${pErr}%` }} />}
          </div>
          <div className="flex justify-between text-xs mt-0.5">
            <span className="text-green-700 font-semibold">✓ {ok} OK</span>
            <span className="text-yellow-700 font-semibold">⚠ {d.alertRtus} Alerta</span>
            <span className="text-red-700 font-semibold">✗ {d.errorRtus} Error</span>
          </div>
        </div>
      )}

      {/* Pozos */}
      {d.wells.length > 0 && (
        <div className="mt-3 pt-2 border-t border-blue-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">Pozos ({d.wells.length})</p>
          <div className="space-y-1">
            {d.wells.map(w => (
              <div key={w._id} className="bg-white border border-blue-100 rounded p-2 text-xs text-gray-800 grid grid-cols-2 gap-x-4 gap-y-0.5">
                <div className="col-span-2 font-semibold">{w.name}</div>
                <div><span className="text-gray-500">C. Obra:</span> <span className="font-medium">{w.workcode}</span></div>
                <div><span className="text-gray-500">DGA:</span> <span className="font-medium">{w.sendtodga ? 'Sí' : 'No'}</span></div>
                <div><span className="text-gray-500">Prof.:</span> <span className="font-medium">{w.depth}m</span></div>
                <div><span className="text-gray-500">Caudal:</span> <span className="font-medium">{w.caudalNominalPermitido} L/s</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PesslCard ─────────────────────────────────────────────────────────────────

function PesslCard({ device: d }: { device: FichaPesslDevice }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 print:p-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-gray-900">{d.name}</span>
          <p className="text-xs text-gray-500">Serial: {d.serial}</p>
        </div>
        <div className="flex gap-1">
          {d.hasWeatherModule && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">🌡 Clima</span>
          )}
          {d.hasSoilModule && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">🪱 Suelo</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700">Última comunicación:</span>
        <span className={`px-3 py-0.5 rounded-full text-white text-xs font-semibold ${commColor(d.lastComm)}`}>
          {commLabel(d.lastComm)}
        </span>
      </div>
    </div>
  );
}

// ── DavisCard ─────────────────────────────────────────────────────────────────

function DavisCard({ device: d }: { device: FichaDavisDevice }) {
  const ms    = d.last_update ? Date.now() - new Date(d.last_update).getTime() : null;
  const hours = ms !== null ? ms / 3_600_000 : null;
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 print:p-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-gray-900">{d.station_name}</span>
          <p className="text-xs text-gray-500">Station ID: {d.station_id}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">🌡 Clima</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-700">Estado:</span>
        <span className={`px-3 py-0.5 rounded-full text-white text-xs font-semibold ${d.active ? 'bg-green-500' : 'bg-gray-400'}`}>
          {d.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700">Última actualización:</span>
        <span className={`px-3 py-0.5 rounded-full text-white text-xs font-semibold ${commColor(hours)}`}>
          {commLabel(hours)}
        </span>
      </div>
    </div>
  );
}

// ── FlorapulseCard ────────────────────────────────────────────────────────────

function FlorapulseCard({ device: d }: { device: FichaFlorapulseDevice }) {
  const ms = d.lastActivityChile ? Date.now() - new Date(d.lastActivityChile).getTime() : null;
  const hours = ms !== null ? ms / 3_600_000 : null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 print:p-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-gray-900">{d.label}</span>
          {d.sectorsData
            ? <p className="text-xs text-gray-500">Sector: {d.sectorsData.name}</p>
            : <p className="text-xs text-gray-400 italic">Sin sector asignado</p>
          }
        </div>
        <div className="flex items-center gap-2 text-xs text-right">
          <span className="text-gray-500">Últ. actividad:</span>
          <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${commColor(hours)}`}>
            {commLabel(hours)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {d.p1 && <SensorPill label={`P1${d.p1.custom_name ? ` — ${d.p1.custom_name}` : ''}`} active={d.p1.active} />}
        {d.p2 && <SensorPill label={`P2${d.p2.custom_name ? ` — ${d.p2.custom_name}` : ''}`} active={d.p2.active} />}
        {d.pswitch && <SensorPill label={`PSwitch${d.pswitch.custom_name ? ` — ${d.pswitch.custom_name}` : ''}`} active={d.pswitch.active} />}
      </div>
    </div>
  );
}

function SensorPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 px-2 py-1 bg-white rounded text-xs border ${active ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-center gap-1">
        <span className={active ? 'text-green-500' : 'text-red-500'}>{active ? '✓' : '✗'}</span>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      <span className={`text-xs ${active ? 'text-green-600' : 'text-red-600'}`}>
        {active ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
}

// ── SectorBar ─────────────────────────────────────────────────────────────────

function SectorBar({ total, kml }: { total: number; kml: number }) {
  const pct = total > 0 ? Math.round((kml / total) * 100) : 0;
  const sin = total - kml;
  return (
    <div className="text-xs text-gray-700 w-full">
      <div className="flex justify-between mb-1">
        <span>Sectores <strong className="text-gray-900">{total}</strong></span>
        <span className="text-green-700 font-medium">{kml} con KML</span>
        <span className="text-yellow-700 font-medium">{sin} sin KML</span>
      </div>
      <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── UserRow ───────────────────────────────────────────────────────────────────

function UserRow({ user: u }: { user: FichaUser }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-1 pr-4 font-medium text-gray-900">{u.name}</td>
      <td className="py-1 pr-4 text-gray-600">{u.email}</td>
      <td className="py-1 text-gray-500">{u.lastLogin ?? '—'}</td>
    </tr>
  );
}
