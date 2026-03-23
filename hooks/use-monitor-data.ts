'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTalgilConnectedAction,
  getPesslConnectedAction,
  getBatteryLogAction,
  getRtuListAction,
  getWellStatusAction,
  clearCacheDevice,
} from '@/actions/dashboard/action';
import { getAllPesslAction } from '@/actions/devices/pessl/action';
import { getWellsAction } from '@/actions/wells/wells';
import { getCountrysidesAction } from '@/actions/countrysides/action';
import { getClientsAction } from '@/actions/clients/action';

/**
 * Hook central de olive_ops.
 * Maneja todas las consultas del monitor de salud de dispositivos.
 * Caché en dos capas: servidor (10 min) + React Query (30-60 min).
 */
export function useMonitorData() {
  const queryClient = useQueryClient();

  // ── Conexiones Talgil ────────────────────────────────────────────────────
  const talgilConns = useQuery({
    queryKey: ['talgilConnections'],
    queryFn: async () => {
      try { return await getTalgilConnectedAction(); }
      catch { return null; }
    },
    staleTime: 30 * 60 * 1000,
  });

  // ── Conexiones Pessl ─────────────────────────────────────────────────────
  const pesslConns = useQuery({
    queryKey: ['pesslConnections'],
    queryFn: async () => {
      try {
        const data = await getPesslConnectedAction();
        // El backend devuelve un array; tomamos el primer elemento (el mapa de períodos)
        return Array.isArray(data) ? data[0] : data;
      }
      catch { return null; }
    },
    staleTime: 30 * 60 * 1000,
  });

  // ── Batería ───────────────────────────────────────────────────────────────
  const batteryList = useQuery({
    queryKey: ['batteryList'],
    queryFn: async () => {
      try { return await getBatteryLogAction(); }
      catch { return []; }
    },
    staleTime: 30 * 60 * 1000,
  });

  // ── Lista de RTUs ────────────────────────────────────────────────────────
  const rtuList = useQuery({
    queryKey: ['rtuList'],
    queryFn: async () => {
      try { return await getRtuListAction(); }
      catch { return []; }
    },
    staleTime: 30 * 60 * 1000,
  });

  // ── Estado de pozos DGA ──────────────────────────────────────────────────
  const wellStatus = useQuery({
    queryKey: ['wellStatus'],
    queryFn: async () => {
      try { return await getWellStatusAction(); }
      catch { return []; }
    },
    staleTime: 30 * 60 * 1000,
  });

  // ── Dispositivos Pessl (catálogo con countryside + client) ───────────────
  const pesslDevices = useQuery({
    queryKey: ['pesslDevices'],
    queryFn: async () => {
      try { return await getAllPesslAction(); }
      catch { return []; }
    },
    staleTime: 60 * 60 * 1000, // 1 hora — catálogo estable
  });

  // ── Pozos (catálogo) ──────────────────────────────────────────────────────
  const wellDevices = useQuery({
    queryKey: ['wellDevices'],
    queryFn: async () => {
      try { return await getWellsAction(); }
      catch { return []; }
    },
    staleTime: 60 * 60 * 1000,
  });

  // ── Campos (countryside) ─────────────────────────────────────────────────
  const countrysides = useQuery({
    queryKey: ['countrysides'],
    queryFn: async () => {
      try { return await getCountrysidesAction(); }
      catch { return []; }
    },
    staleTime: 45 * 60 * 1000,
  });

  // ── Clientes ──────────────────────────────────────────────────────────────
  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try { return await getClientsAction(); }
      catch { return []; }
    },
    staleTime: 45 * 60 * 1000,
  });

  // ── Refresh manual (limpia caché servidor + invalida React Query) ─────────
  const refetchAll = async () => {
    await clearCacheDevice();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['talgilConnections'] }),
      queryClient.invalidateQueries({ queryKey: ['pesslConnections'] }),
      queryClient.invalidateQueries({ queryKey: ['batteryList'] }),
      queryClient.invalidateQueries({ queryKey: ['rtuList'] }),
      queryClient.invalidateQueries({ queryKey: ['wellStatus'] }),
      queryClient.invalidateQueries({ queryKey: ['pesslDevices'] }),
      queryClient.invalidateQueries({ queryKey: ['wellDevices'] }),
      queryClient.invalidateQueries({ queryKey: ['countrysides'] }),
      queryClient.invalidateQueries({ queryKey: ['clients'] }),
    ]);
  };

  const isLoading =
    talgilConns.isLoading ||
    pesslConns.isLoading ||
    batteryList.isLoading ||
    rtuList.isLoading ||
    wellStatus.isLoading ||
    pesslDevices.isLoading ||
    wellDevices.isLoading ||
    countrysides.isLoading ||
    clients.isLoading;

  const isRefetching =
    talgilConns.isRefetching ||
    pesslConns.isRefetching ||
    batteryList.isRefetching ||
    rtuList.isRefetching ||
    wellStatus.isRefetching ||
    pesslDevices.isRefetching ||
    wellDevices.isRefetching ||
    countrysides.isRefetching ||
    clients.isRefetching;

  return {
    // Datos de conexión en tiempo real
    talgilConns,
    pesslConns,
    batteryList,
    rtuList,
    wellStatus,
    // Catálogos de dispositivos
    pesslDevices,
    wellDevices,
    // Datos organizativos
    countrysides,
    clients,
    // Control
    refetchAll,
    isLoading,
    isRefetching,
  };
}
