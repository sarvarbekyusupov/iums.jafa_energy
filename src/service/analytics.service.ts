import { apiClient } from './api-client';

interface HistoricalTrends {
  period: string;
  metrics: TrendMetric[];
  comparison: ComparisonData;
}

interface TrendMetric {
  name: string;
  values: DataPoint[];
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

interface DataPoint {
  timestamp: string;
  value: number;
}

interface ComparisonData {
  previousPeriod: number;
  currentPeriod: number;
  change: number;
  changePercentage: number;
}

interface SeasonalPatterns {
  seasons: SeasonalData[];
  insights: string[];
  recommendations: string[];
}

interface SeasonalData {
  season: string;
  averageProduction: number;
  peakProduction: number;
  efficiency: number;
  monthlyBreakdown: MonthlyData[];
}

interface MonthlyData {
  month: string;
  production: number;
  efficiency: number;
}

interface PerformanceBenchmarks {
  industryAverage: BenchmarkData;
  topPerformers: BenchmarkData;
  userPerformance: BenchmarkData;
  recommendations: string[];
}

interface BenchmarkData {
  performanceRatio: number;
  capacityFactor: number;
  availability: number;
  degradationRate: number;
}

interface PredictiveMaintenanceAlert {
  id: string;
  deviceId: number;
  deviceName: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  predictedDate: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

interface YearOverYearComparison {
  currentYear: YearlyData;
  previousYear: YearlyData;
  comparison: ComparisonData;
  monthlyComparison: MonthlyComparison[];
}

interface YearlyData {
  year: number;
  totalProduction: number;
  averageEfficiency: number;
  uptime: number;
  revenue: number;
}

interface MonthlyComparison {
  month: string;
  currentYear: number;
  previousYear: number;
  change: number;
  changePercentage: number;
}

interface ExecutiveDashboard {
  summary: ExecutiveSummary;
  keyMetrics: KeyMetric[];
  trends: TrendSummary[];
  alerts: ExecutiveAlert[];
  recommendations: string[];
}

interface ExecutiveSummary {
  totalSites: number;
  totalCapacity: number;
  monthlyProduction: number;
  monthlyRevenue: number;
  systemEfficiency: number;
  carbonOffset: number;
}

interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  changePercentage: number;
  status: 'good' | 'warning' | 'critical';
}

interface TrendSummary {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

interface ExecutiveAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  impact: string;
}

class AnalyticsService {
  private readonly baseUrl = '/api/analytics';

  // Historical Analysis
  async getHistoricalTrends(siteIds?: number[], monthsBack?: number): Promise<HistoricalTrends> {
    const params = new URLSearchParams();
    if (siteIds && siteIds.length > 0) {
      siteIds.forEach(id => params.append('siteIds', id.toString()));
    }
    if (monthsBack) params.append('monthsBack', monthsBack.toString());

    const response = await apiClient.get(`${this.baseUrl}/trends/historical?${params.toString()}`);
    return response.data;
  }

  async getSeasonalPatterns(siteIds?: number[]): Promise<SeasonalPatterns> {
    const params = new URLSearchParams();
    if (siteIds && siteIds.length > 0) {
      siteIds.forEach(id => params.append('siteIds', id.toString()));
    }

    const response = await apiClient.get(`${this.baseUrl}/patterns/seasonal?${params.toString()}`);
    return response.data;
  }

  // Performance Analysis
  async getPerformanceBenchmarks(): Promise<PerformanceBenchmarks> {
    const response = await apiClient.get(`${this.baseUrl}/benchmarks/performance`);
    return response.data;
  }

  async getYearOverYearComparison(siteIds?: number[]): Promise<YearOverYearComparison> {
    const params = new URLSearchParams();
    if (siteIds && siteIds.length > 0) {
      siteIds.forEach(id => params.append('siteIds', id.toString()));
    }

    const response = await apiClient.get(`${this.baseUrl}/comparison/year-over-year?${params.toString()}`);
    return response.data;
  }

  // Predictive Analytics
  async getPredictiveMaintenanceAlerts(): Promise<PredictiveMaintenanceAlert[]> {
    const response = await apiClient.get(`${this.baseUrl}/maintenance/predictive`);
    return response.data;
  }

  // Executive Dashboard
  async getExecutiveDashboard(siteIds?: number[]): Promise<ExecutiveDashboard> {
    const params = new URLSearchParams();
    if (siteIds && siteIds.length > 0) {
      siteIds.forEach(id => params.append('siteIds', id.toString()));
    }

    const response = await apiClient.get(`${this.baseUrl}/dashboard/executive?${params.toString()}`);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();