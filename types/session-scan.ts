// ── Enums (subset OPS del backend) ───────────────────────────────────────────

export enum OpsScanModule {
  OPS_SESSION = 'ops.session',
  OPS_HEALTH_DASHBOARD = 'ops.health-dashboard',
  OPS_CLIENT_FIELDS = 'ops.client-fields',
  OPS_FIELD_DETAIL = 'ops.field-detail',
  OPS_TALGIL_MONITOR = 'ops.talgil-monitor',
  OPS_PESSL_MONITOR = 'ops.pessl-monitor',
  OPS_POZOS_MONITOR = 'ops.pozos-monitor',
  OPS_PRINT = 'ops.print',
}

export enum ScanActionType {
  LOGIN = 'scan.login',
  LOGOUT = 'scan.logout',
  REFRESH = 'scan.refresh',
  NAVIGATE = 'scan.navigate',
  READ = 'scan.read',
  CREATE = 'scan.create',
  UPDATE = 'scan.update',
  DELETE = 'scan.delete',
  EXPORT = 'scan.export',
  SYNC = 'scan.sync',
  MERGE = 'scan.merge',
  MAINTENANCE = 'scan.maintenance',
  ADMIN = 'scan.admin',
  BULK = 'scan.bulk',
  UI = 'scan.ui',
}

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ScanUserRole {
  isAdmin: boolean;
  isReadOnlyAdmin: boolean;
  zenoSamaMode: boolean;
}

/** DTO completo enviado al backend POST /session-scan */
export interface CreateSessionScanDto {
  sessionId: string;
  userId: string;
  userEmail: string;
  userRole: ScanUserRole;
  scanModule: OpsScanModule;
  action: string;
  actionType: ScanActionType;
  description: string;
  entity?: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

/** Evento parcial que envían los componentes (sin datos de identidad) */
export interface SessionScanEvent {
  scanModule: OpsScanModule;
  action: string;
  actionType: ScanActionType;
  description: string;
  entity?: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}
