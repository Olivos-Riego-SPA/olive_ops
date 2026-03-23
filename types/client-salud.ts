export type HealthStatus = 'ok' | 'warning' | 'critical';

export interface TalgilSalud {
  serial: string;
  name: string;
  hoursSinceComm: number | null;
  batteryPct: number | null;
  rtus: { total: number; ok: number; errors: number; alerts: number; problemRtus: { name: string; uid: string; stateLabel: string; state: number; _id: string }[] } | null;
  score: number;       // 0–1
  status: HealthStatus;
  problems: string[];
}

export interface PesslSalud {
  serial: string;
  name: string;
  hoursSinceComm: number | null;
  score: number;
  status: HealthStatus;
  problems: string[];
}

export interface PozoSalud {
  wellId: string;
  name: string;
  hasError: boolean;
  hasWarning: boolean;  // informacional — no afecta health score
  sendtodga: boolean;
  pendingData: number | null;
  score: number;
  status: HealthStatus;
  problems: string[];
}

export interface CampoSalud {
  campoId: string;
  campoName: string;
  talgilDevices: TalgilSalud[];
  pesslDevices: PesslSalud[];
  pozos: PozoSalud[];
  score: number;       // 0–1
  status: HealthStatus;
  topProblems: string[];
}

export interface ClientSalud {
  clientId: string;
  clientName: string;
  campos: CampoSalud[];
  globalScore: number;      // 0–100 (redondeado)
  globalStatus: HealthStatus;
  topProblems: string[];
  // Presencia de tecnología
  hasTalgil: boolean;
  hasPessl: boolean;
  hasPozos: boolean;
  // Score por tecnología (null = no tiene esa tech)
  talgilScore: number | null;
  pesslScore: number | null;
  pozosScore: number | null;
  // Conteo de dispositivos
  talgilCount: number;
  pesslCount: number;
  pozosCount: number;
}
