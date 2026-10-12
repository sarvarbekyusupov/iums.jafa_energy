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
  provider: 'soliscloud' | 'hopecloud';
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
