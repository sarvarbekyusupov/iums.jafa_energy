/** Vendors whose inverters the availability and temperature reports cover. */
export type VendorKey = 'soliscloud' | 'hopecloud' | 'huawei';

export interface AvailabilityOutage {
  start: string;
  /** Null while the outage is still going on. */
  end: string | null;
  /** Daylight minutes lost; nights inside a multi-day outage are not counted. */
  downtimeMinutes: number;
  /** "silent": the inverter sent nothing. "zero": it reported but produced nothing. */
  kind: 'silent' | 'zero';
  /** Vendor alarms open during the outage, most frequent first. */
  causes: string[];
}

export interface AvailabilityInverter {
  sn: string;
  availabilityPct: number | null;
  upMinutes: number;
  downMinutes: number;
  unknownMinutes: number;
  neverReported: boolean;
  connectionOnly: boolean;
  firstSeen: string | null;
  outages: AvailabilityOutage[];
}

export interface AvailabilityStation {
  provider: VendorKey;
  stationId: string;
  name: string;
  availabilityPct: number | null;
  upMinutes: number;
  downMinutes: number;
  unknownMinutes: number;
  outageCount: number;
  longestOutageMinutes: number;
  downNow: boolean;
  inverters: AvailabilityInverter[];
}

export interface AvailabilityReport {
  from: string;
  to: string;
  measuredSince: string;
  slotMinutes: number;
  marginMinutes: number;
  generatedAt: string;
  fleet: {
    availabilityPct: number | null;
    upMinutes: number;
    downMinutes: number;
    unknownMinutes: number;
    stations: number;
  };
  stations: AvailabilityStation[];
}

export interface InverterTemperature {
  provider: VendorKey;
  stationId: string;
  station: string;
  sn: string;
  currentCelsius: number | null;
  currentAt: string | null;
  todayMaxCelsius: number | null;
  windowMaxCelsius: number | null;
  windowMaxAt: string | null;
  hotMinutes: number;
  hotNow: boolean;
}

export interface TemperatureReport {
  /** Warning line per vendor, °C. */
  warnCelsius: Partial<Record<VendorKey, number>>;
  windowDays: number;
  generatedAt: string;
  inverters: InverterTemperature[];
}
