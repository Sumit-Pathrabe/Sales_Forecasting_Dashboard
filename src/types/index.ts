export interface SalesData {
  date: string;
  revenue: number;
  units: number;
  month: string;
}

export interface ForecastData {
  date: string;
  revenue: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface ForecastParams {
  periods: number;
  seasonality: boolean;
  trendStrength: number;
  method: 'linear' | 'exponential' | 'moving_average';
}

export interface KPIData {
  currentRevenue: number;
  forecastRevenue: number;
  revenueGrowth: number;
  forecastGrowth: number;
  growthRate: number;
  growthTrend: number;
  accuracy: number;
  accuracyTrend: number;
}

export interface Insight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  action?: string;
}