import { describe, it, expect } from 'vitest';
import { OpsScanModule, ScanActionType } from '@/types/session-scan';
import type { CreateSessionScanDto, SessionScanEvent, ScanUserRole } from '@/types/session-scan';

describe('session-scan types', () => {
  describe('OpsScanModule enum', () => {
    it('contains all expected modules', () => {
      expect(OpsScanModule.OPS_SESSION).toBe('ops.session');
      expect(OpsScanModule.OPS_HEALTH_DASHBOARD).toBe('ops.health-dashboard');
      expect(OpsScanModule.OPS_CLIENT_FIELDS).toBe('ops.client-fields');
      expect(OpsScanModule.OPS_FIELD_DETAIL).toBe('ops.field-detail');
      expect(OpsScanModule.OPS_TALGIL_MONITOR).toBe('ops.talgil-monitor');
      expect(OpsScanModule.OPS_PESSL_MONITOR).toBe('ops.pessl-monitor');
      expect(OpsScanModule.OPS_POZOS_MONITOR).toBe('ops.pozos-monitor');
      expect(OpsScanModule.OPS_PRINT).toBe('ops.print');
    });

    it('has exactly 8 modules', () => {
      expect(Object.keys(OpsScanModule)).toHaveLength(8);
    });
  });

  describe('ScanActionType enum', () => {
    it('contains all expected action types', () => {
      expect(ScanActionType.LOGIN).toBe('scan.login');
      expect(ScanActionType.LOGOUT).toBe('scan.logout');
      expect(ScanActionType.REFRESH).toBe('scan.refresh');
      expect(ScanActionType.NAVIGATE).toBe('scan.navigate');
      expect(ScanActionType.READ).toBe('scan.read');
      expect(ScanActionType.CREATE).toBe('scan.create');
      expect(ScanActionType.UPDATE).toBe('scan.update');
      expect(ScanActionType.DELETE).toBe('scan.delete');
      expect(ScanActionType.EXPORT).toBe('scan.export');
      expect(ScanActionType.SYNC).toBe('scan.sync');
      expect(ScanActionType.MERGE).toBe('scan.merge');
      expect(ScanActionType.MAINTENANCE).toBe('scan.maintenance');
      expect(ScanActionType.ADMIN).toBe('scan.admin');
      expect(ScanActionType.BULK).toBe('scan.bulk');
      expect(ScanActionType.UI).toBe('scan.ui');
    });

    it('has exactly 15 action types', () => {
      expect(Object.keys(ScanActionType)).toHaveLength(15);
    });

    it('all values follow scan.* prefix convention', () => {
      for (const value of Object.values(ScanActionType)) {
        expect(value).toMatch(/^scan\./);
      }
    });
  });

  describe('interface contracts (compile-time + runtime shape)', () => {
    it('CreateSessionScanDto has all required fields', () => {
      const dto: CreateSessionScanDto = {
        sessionId: 'sess-1',
        userId: 'user-1',
        userEmail: 'test@olivos.cl',
        userRole: { isAdmin: false, isReadOnlyAdmin: false, zenoSamaMode: false },
        scanModule: OpsScanModule.OPS_SESSION,
        action: 'ops.session.login',
        actionType: ScanActionType.LOGIN,
        description: 'Test login',
      };

      expect(dto.sessionId).toBe('sess-1');
      expect(dto.userId).toBe('user-1');
      expect(dto.userEmail).toBe('test@olivos.cl');
      expect(dto.userRole.isAdmin).toBe(false);
    });

    it('CreateSessionScanDto allows optional fields', () => {
      const dto: CreateSessionScanDto = {
        sessionId: 'sess-1',
        userId: 'user-1',
        userEmail: 'test@olivos.cl',
        userRole: { isAdmin: true, isReadOnlyAdmin: false, zenoSamaMode: true },
        scanModule: OpsScanModule.OPS_HEALTH_DASHBOARD,
        action: 'ops.health.view',
        actionType: ScanActionType.READ,
        description: 'View dashboard',
        entity: 'client',
        entityId: 'c1',
        entityName: 'Cliente A',
        metadata: { extra: 'data' },
        success: true,
        errorMessage: undefined,
      };

      expect(dto.entity).toBe('client');
      expect(dto.entityId).toBe('c1');
      expect(dto.metadata).toEqual({ extra: 'data' });
      expect(dto.success).toBe(true);
    });

    it('SessionScanEvent omits identity fields', () => {
      const event: SessionScanEvent = {
        scanModule: OpsScanModule.OPS_PRINT,
        action: 'ops.print.ficha-cliente',
        actionType: ScanActionType.EXPORT,
        description: 'Generate report',
        entityId: 'c1',
      };

      // SessionScanEvent should NOT have sessionId, userId, userEmail, userRole
      expect(event).not.toHaveProperty('sessionId');
      expect(event).not.toHaveProperty('userId');
      expect(event).not.toHaveProperty('userEmail');
      expect(event).not.toHaveProperty('userRole');
    });

    it('ScanUserRole has all role flags', () => {
      const role: ScanUserRole = {
        isAdmin: true,
        isReadOnlyAdmin: false,
        zenoSamaMode: true,
      };

      expect(role.isAdmin).toBe(true);
      expect(role.isReadOnlyAdmin).toBe(false);
      expect(role.zenoSamaMode).toBe(true);
    });
  });
});
