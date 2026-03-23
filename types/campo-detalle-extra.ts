
export interface TalgilWellRich {
  _id: string;
  name: string;
  depth: number;
  caudalNominalPermitido: number;
  sendtodga: boolean;
  workcode: string;
}

export interface TalgilRich {
  _id: string;
  serial: number;
  name: string;
  isDream: boolean;
  countryside: string;
  batteryStatus: string | null;
  battery: number | null;
  rtuStatus: string | null;
  totalRtus: number | null;
  errorRtus: number | null;
  alertRtus: number | null;
  hasIrrigation: boolean;
  hasPlantModule: boolean;
  hasSoilModule: boolean;
  hasWell: boolean;
  hasDga: boolean;
  wells: TalgilWellRich[];
}

export interface FlorapulseDevice {
  _id: string;
  label: string;
  is_active: boolean;
  countryside: string;
  sector_id: string;
  p1: { active: boolean; custom_name: string | null };
  p2: { active: boolean; custom_name: string | null };
  pswitch: { active: boolean; custom_name: string };
  lastActivityChile: string;
  sectorsData?: { _id: string; name: string };
}

export interface DavisDevice {
  _id: string;
  station_id: number;
  station_name: string;
  active: boolean;
  countryside_id: string;
  last_update: string;
}

export interface CampoExtraData {
  talgil: TalgilRich[];
  florapulse: FlorapulseDevice[];
  davis: DavisDevice[];
}
