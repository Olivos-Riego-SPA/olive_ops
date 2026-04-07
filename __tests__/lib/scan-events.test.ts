import { describe, it, expect } from 'vitest';
import { OPS } from '@/lib/scan-events';
import { OpsScanModule, ScanActionType } from '@/types/session-scan';

describe('scan-events: OPS event factories', () => {
  // ── Structure tests ──────────────────────────────────────────────────────

  it('every OPS key returns a function', () => {
    for (const [key, factory] of Object.entries(OPS)) {
      expect(typeof factory).toBe('function');
    }
  });

  it('every factory produces an event with required fields', () => {
    for (const [key, factory] of Object.entries(OPS)) {
      const event = (factory as Function)();
      expect(event).toHaveProperty('scanModule');
      expect(event).toHaveProperty('action');
      expect(event).toHaveProperty('actionType');
      expect(event).toHaveProperty('description');
      expect(typeof event.scanModule).toBe('string');
      expect(typeof event.action).toBe('string');
      expect(typeof event.actionType).toBe('string');
      expect(typeof event.description).toBe('string');
    }
  });

  it('every scanModule is a valid OpsScanModule enum value', () => {
    const validModules = Object.values(OpsScanModule);
    for (const [key, factory] of Object.entries(OPS)) {
      const event = (factory as Function)();
      expect(validModules).toContain(event.scanModule);
    }
  });

  it('every actionType is a valid ScanActionType enum value', () => {
    const validTypes = Object.values(ScanActionType);
    for (const [key, factory] of Object.entries(OPS)) {
      const event = (factory as Function)();
      expect(validTypes).toContain(event.actionType);
    }
  });

  // ── Override tests ───────────────────────────────────────────────────────

  it('factory accepts overrides that merge into the event', () => {
    const event = OPS.healthView({ entityId: 'test-123', metadata: { extra: true } });
    expect(event.entityId).toBe('test-123');
    expect(event.metadata).toEqual({ extra: true });
    // Base fields still present
    expect(event.scanModule).toBe(OpsScanModule.OPS_HEALTH_DASHBOARD);
    expect(event.action).toBe('ops.health.view');
  });

  it('overrides can replace base fields', () => {
    const event = OPS.healthView({ description: 'Custom description' });
    expect(event.description).toBe('Custom description');
  });

  it('factory without overrides returns clean event (no undefined keys)', () => {
    const event = OPS.healthView();
    expect(event.entityId).toBeUndefined();
    expect(event.entityName).toBeUndefined();
    expect(event.metadata).toBeUndefined();
  });

  // ── Specific event tests ─────────────────────────────────────────────────

  describe('SESSION events', () => {
    it('login produces correct event', () => {
      const event = OPS.login();
      expect(event.scanModule).toBe(OpsScanModule.OPS_SESSION);
      expect(event.action).toBe('ops.session.login');
      expect(event.actionType).toBe(ScanActionType.LOGIN);
    });

    it('loginFailed produces correct event', () => {
      const event = OPS.loginFailed({ success: false, errorMessage: 'bad creds' });
      expect(event.actionType).toBe(ScanActionType.LOGIN);
      expect(event.success).toBe(false);
      expect(event.errorMessage).toBe('bad creds');
    });

    it('logout produces correct event', () => {
      const event = OPS.logout();
      expect(event.action).toBe('ops.session.logout');
      expect(event.actionType).toBe(ScanActionType.LOGOUT);
    });

    it('refresh produces correct event', () => {
      const event = OPS.refresh();
      expect(event.actionType).toBe(ScanActionType.REFRESH);
    });
  });

  describe('HEALTH DASHBOARD events', () => {
    it('healthSearch includes metadata override', () => {
      const event = OPS.healthSearch({ metadata: { query: 'olivos' } });
      expect(event.scanModule).toBe(OpsScanModule.OPS_HEALTH_DASHBOARD);
      expect(event.actionType).toBe(ScanActionType.READ);
      expect(event.metadata).toEqual({ query: 'olivos' });
    });

    it('healthSort includes metadata override', () => {
      const event = OPS.healthSort({ metadata: { sortBy: 'category' } });
      expect(event.actionType).toBe(ScanActionType.UI);
      expect(event.metadata).toEqual({ sortBy: 'category' });
    });

    it('healthSelectClient includes entity info', () => {
      const event = OPS.healthSelectClient({ entityId: 'c1', entityName: 'Cliente A' });
      expect(event.actionType).toBe(ScanActionType.NAVIGATE);
      expect(event.entityId).toBe('c1');
      expect(event.entityName).toBe('Cliente A');
    });
  });

  describe('CLIENT FIELDS events', () => {
    it('clientFieldsSearch produces correct event', () => {
      const event = OPS.clientFieldsSearch({ metadata: { query: 'campo norte' } });
      expect(event.scanModule).toBe(OpsScanModule.OPS_CLIENT_FIELDS);
      expect(event.action).toBe('ops.client-fields.search');
      expect(event.actionType).toBe(ScanActionType.READ);
    });

    it('clientFieldsRefresh produces correct event', () => {
      const event = OPS.clientFieldsRefresh();
      expect(event.action).toBe('ops.client-fields.refresh');
      expect(event.actionType).toBe(ScanActionType.READ);
    });

    it('clientFieldsSelectCampo includes entity info', () => {
      const event = OPS.clientFieldsSelectCampo({ entityId: 'f1', entityName: 'Campo Sur' });
      expect(event.actionType).toBe(ScanActionType.NAVIGATE);
      expect(event.entityId).toBe('f1');
    });
  });

  describe('FIELD DETAIL events', () => {
    it('fieldDetailView produces correct event', () => {
      const event = OPS.fieldDetailView({ entityId: 'f1' });
      expect(event.scanModule).toBe(OpsScanModule.OPS_FIELD_DETAIL);
      expect(event.actionType).toBe(ScanActionType.READ);
    });

    it('fieldDetailPrint produces correct event', () => {
      const event = OPS.fieldDetailPrint({ entityId: 'f1' });
      expect(event.actionType).toBe(ScanActionType.NAVIGATE);
    });
  });

  describe('TALGIL MONITOR events', () => {
    it('talgilViewDevices includes count metadata', () => {
      const event = OPS.talgilViewDevices({ entityId: 'f1', metadata: { count: 5 } });
      expect(event.scanModule).toBe(OpsScanModule.OPS_TALGIL_MONITOR);
      expect(event.metadata).toEqual({ count: 5 });
    });

    it('talgilExpandRtuProblems produces UI action type', () => {
      const event = OPS.talgilExpandRtuProblems({ entityId: 's1', entityName: 'Device A' });
      expect(event.actionType).toBe(ScanActionType.UI);
    });

    it('talgilViewRtuHistory produces READ action type', () => {
      const event = OPS.talgilViewRtuHistory({ entityId: 'rtu1' });
      expect(event.actionType).toBe(ScanActionType.READ);
    });
  });

  describe('PRINT events', () => {
    it('printFichaCliente produces EXPORT action type', () => {
      const event = OPS.printFichaCliente({ entityId: 'c1' });
      expect(event.scanModule).toBe(OpsScanModule.OPS_PRINT);
      expect(event.actionType).toBe(ScanActionType.EXPORT);
    });

    it('printSavePdf produces EXPORT action type', () => {
      const event = OPS.printSavePdf({ entityId: 'c1' });
      expect(event.actionType).toBe(ScanActionType.EXPORT);
    });

    it('printBack produces NAVIGATE action type', () => {
      const event = OPS.printBack();
      expect(event.actionType).toBe(ScanActionType.NAVIGATE);
    });
  });

  describe('UI events', () => {
    it('userMenuOpen produces correct event', () => {
      const event = OPS.userMenuOpen();
      expect(event.scanModule).toBe(OpsScanModule.OPS_SESSION);
      expect(event.actionType).toBe(ScanActionType.UI);
    });

    it('monitorRefresh produces correct event', () => {
      const event = OPS.monitorRefresh();
      expect(event.scanModule).toBe(OpsScanModule.OPS_HEALTH_DASHBOARD);
      expect(event.actionType).toBe(ScanActionType.READ);
    });
  });

  // ── Action naming convention ─────────────────────────────────────────────

  it('all actions follow ops.* naming convention', () => {
    for (const [key, factory] of Object.entries(OPS)) {
      const event = (factory as Function)();
      expect(event.action).toMatch(/^ops\./);
    }
  });

  it('no two events share the same action string', () => {
    const actions = Object.entries(OPS).map(([, factory]) => (factory as Function)().action);
    const unique = new Set(actions);
    expect(unique.size).toBe(actions.length);
  });
});
