// ── Ficha de salud — tipos de datos para la vista de impresión ─────────────────
// Equivalente a ClientInfo / ClientCoutryside de plataforma-soporte
// pero adaptado al backend de olive_ops.

export interface FichaWell {
  _id: string;
  name: string;
  depth: number;
  caudalNominalPermitido: number;
  sendtodga: boolean;
  workcode: string;
}

export interface FichaTalgilDevice {
  _id: string;
  serial: number;
  name: string;
  isDream: boolean;
  battery: number;
  batteryStatus: string;
  lastComm: number | null;       // horas desde la última comunicación
  totalRtus: number;
  errorRtus: number;
  alertRtus: number;
  hasIrrigation: boolean;
  hasPlantModule: boolean;
  hasSoilModule: boolean;
  hasWell: boolean;
  hasDga: boolean;
  wells: FichaWell[];
}

export interface FichaPesslDevice {
  _id: string;
  serial: string;
  name: string;
  hasWeatherModule: boolean;
  hasSoilModule: boolean;
  lastComm: number | null;
}

export interface FichaFlorapulseDevice {
  _id: string;
  label: string;
  p1:      { active: boolean; custom_name: string | null } | null;
  p2:      { active: boolean; custom_name: string | null } | null;
  pswitch: { active: boolean; custom_name: string | null } | null;
  lastActivityChile: string;
  sectorsData?: { _id: string; name: string };
}

export interface FichaDavisDevice {
  _id: string;
  station_id: number;
  station_name: string;
  active: boolean;
  last_update: string;
}

export interface FichaUser {
  _id: string;
  name: string;
  email: string;
  lastLogin: string | null;
}

export interface FichaCampo {
  _id: string;
  name: string;
  active: boolean;
  // Módulos del campo
  hasIrrigationModule: boolean;
  hasPlantModule: boolean;
  hasWeatherModule: boolean;
  hasSoilModule: boolean;
  hasWellModule: boolean;
  // Sectores
  totalSector: number;
  kmlSector: number;
  // Dispositivos
  talgilDevices: FichaTalgilDevice[];
  pesslDevices: FichaPesslDevice[];
  florapulseDevices: FichaFlorapulseDevice[];
  davisDevices: FichaDavisDevice[];
  // Usuarios del campo
  users: FichaUser[];
}

export interface FichaData {
  clientId: string;
  clientName: string;
  campos: FichaCampo[];
}
