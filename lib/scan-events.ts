import { OpsScanModule, ScanActionType } from '@/types/session-scan';
import type { SessionScanEvent } from '@/types/session-scan';

type EventFactory = (overrides?: Partial<SessionScanEvent>) => SessionScanEvent;

function ev(
  scanModule: OpsScanModule,
  action: string,
  actionType: ScanActionType,
  description: string,
): EventFactory {
  return (overrides) => ({ scanModule, action, actionType, description, ...overrides });
}

export const OPS = {
  // ── SESSION ────────────────────────────────────────────────────────────────
  login: ev(OpsScanModule.OPS_SESSION, 'ops.session.login', ScanActionType.LOGIN, 'Login en Olive Ops'),
  loginFailed: ev(OpsScanModule.OPS_SESSION, 'ops.session.login.failed', ScanActionType.LOGIN, 'Intento de login fallido en Olive Ops'),
  logout: ev(OpsScanModule.OPS_SESSION, 'ops.session.logout', ScanActionType.LOGOUT, 'Cierre de sesión en Olive Ops'),
  refresh: ev(OpsScanModule.OPS_SESSION, 'ops.session.refresh', ScanActionType.REFRESH, 'Renovación de token en Olive Ops'),

  // ── HEALTH DASHBOARD ───────────────────────────────────────────────────────
  healthView: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.health.view', ScanActionType.READ, 'Ver dashboard de salud de clientes'),
  healthSearch: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.health.search', ScanActionType.READ, 'Buscar cliente por nombre'),
  healthSort: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.health.sort', ScanActionType.UI, 'Cambiar ordenamiento'),
  healthRefresh: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.health.refresh', ScanActionType.READ, 'Pull-to-refresh datos de salud'),
  healthSelectClient: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.health.select-client', ScanActionType.NAVIGATE, 'Seleccionar cliente para ver campos'),

  // ── CLIENT FIELDS ──────────────────────────────────────────────────────────
  clientFieldsView: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.view', ScanActionType.READ, 'Ver lista de campos del cliente'),
  clientFieldsSearch: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.search', ScanActionType.READ, 'Buscar campo por nombre'),
  clientFieldsRefresh: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.refresh', ScanActionType.READ, 'Pull-to-refresh datos de campos'),
  clientFieldsSelectCampo: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.select-campo', ScanActionType.NAVIGATE, 'Seleccionar campo para ver detalle'),
  clientFieldsBack: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.back', ScanActionType.NAVIGATE, 'Volver a lista de clientes'),
  clientFieldsPrint: ev(OpsScanModule.OPS_CLIENT_FIELDS, 'ops.client-fields.print', ScanActionType.NAVIGATE, 'Abrir ficha de cliente para imprimir'),

  // ── FIELD DETAIL ───────────────────────────────────────────────────────────
  fieldDetailView: ev(OpsScanModule.OPS_FIELD_DETAIL, 'ops.field-detail.view', ScanActionType.READ, 'Ver detalle de campo con dispositivos'),
  fieldDetailBack: ev(OpsScanModule.OPS_FIELD_DETAIL, 'ops.field-detail.back', ScanActionType.NAVIGATE, 'Volver a lista de campos'),
  fieldDetailPrint: ev(OpsScanModule.OPS_FIELD_DETAIL, 'ops.field-detail.print', ScanActionType.NAVIGATE, 'Abrir ficha de campo para imprimir'),

  // ── TALGIL MONITOR ─────────────────────────────────────────────────────────
  talgilViewDevices: ev(OpsScanModule.OPS_TALGIL_MONITOR, 'ops.talgil.view-devices', ScanActionType.READ, 'Ver dispositivos Talgil del campo'),
  talgilExpandRtuProblems: ev(OpsScanModule.OPS_TALGIL_MONITOR, 'ops.talgil.expand-rtu-problems', ScanActionType.UI, 'Expandir sección RTU con problemas'),
  talgilViewRtuHistory: ev(OpsScanModule.OPS_TALGIL_MONITOR, 'ops.talgil.view-rtu-history', ScanActionType.READ, 'Ver historial de estado RTU (3 días)'),
  // ── PESSL MONITOR ──────────────────────────────────────────────────────────
  pesslViewDevices: ev(OpsScanModule.OPS_PESSL_MONITOR, 'ops.pessl.view-devices', ScanActionType.READ, 'Ver dispositivos Pessl del campo'),

  // ── POZOS MONITOR ──────────────────────────────────────────────────────────
  pozosViewWells: ev(OpsScanModule.OPS_POZOS_MONITOR, 'ops.pozos.view-wells', ScanActionType.READ, 'Ver pozos DGA del campo'),

  // ── UI ─────────────────────────────────────────────────────────────────────
  userMenuOpen: ev(OpsScanModule.OPS_SESSION, 'ops.ui.user-menu-open', ScanActionType.UI, 'Abrir menú de usuario'),
  monitorRefresh: ev(OpsScanModule.OPS_HEALTH_DASHBOARD, 'ops.monitor.refresh', ScanActionType.READ, 'Refrescar datos del monitor de dispositivos'),

  // ── PRINT ──────────────────────────────────────────────────────────────────
  printFichaCliente: ev(OpsScanModule.OPS_PRINT, 'ops.print.ficha-cliente', ScanActionType.EXPORT, 'Generar ficha técnica de cliente'),
  printFichaCampo: ev(OpsScanModule.OPS_PRINT, 'ops.print.ficha-campo', ScanActionType.EXPORT, 'Generar ficha técnica de campo'),
  printSavePdf: ev(OpsScanModule.OPS_PRINT, 'ops.print.save-pdf', ScanActionType.EXPORT, 'Guardar reporte como PDF'),
  printBack: ev(OpsScanModule.OPS_PRINT, 'ops.print.back', ScanActionType.NAVIGATE, 'Volver desde vista de impresión'),
} as const;
