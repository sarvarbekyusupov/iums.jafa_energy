export type ForecastProvider = 'hopecloud' | 'soliscloud' | 'fsolar';
export type ForecastConfidence = 'high' | 'medium';
/** "measured" = worked out from this station's own output, "default" = the configured guess. */
export type PerformanceRatioSource = 'measured' | 'default';

export interface ForecastDay {
  date: string;
  horizonDays: number;
  confidence: ForecastConfidence;
  radiationKwhM2?: number;
  sunshineHours?: number;
  tempMax?: number;
  tempMin?: number;
  precipitationMm?: number;
  cloudCover?: number;
  weatherCode?: number;
  predictedKwh?: number;
  predictedRevenueUzs?: number;
}

export interface ForecastTotals {
  days: number;
  kwh: number;
  revenueUzs: number;
}

export interface StationForecast {
  provider: ForecastProvider;
  stationId: string;
  stationName?: string;
  capacityKw?: number;
  performanceRatio: number;
  performanceRatioSource: PerformanceRatioSource;
  coordinatesApproximate: boolean;
  issuedAt?: string;
  days: ForecastDay[];
  totals: ForecastTotals;
}

export interface ForecastSummary {
  currency: 'UZS';
  pricePerKwhUzs: number;
  issuedAt: string | null;
  stations: number;
  anyDefaultRatio: boolean;
  coordinatesApproximate: boolean;
  next7: ForecastTotals;
  next15: ForecastTotals;
  perDay: ForecastDay[];
}
