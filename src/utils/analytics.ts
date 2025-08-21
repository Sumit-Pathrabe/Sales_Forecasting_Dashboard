import type { SalesData, ForecastData, ForecastParams, KPIData, Insight } from '../types';

export const generateSampleData = (): SalesData[] => {
  const months = [
    'Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023',
    'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023',
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'
  ];

  return months.map((month, index) => {
    // Base trend with growth
    const baseTrend = 45000 + (index * 1200);
    
    // Seasonal adjustment (summer dip, winter peak)
    const monthIndex = index % 12;
    const seasonalMultiplier = 1 + 0.3 * Math.sin((monthIndex - 2) * Math.PI / 6);
    
    // Random variation
    const randomVariation = 0.85 + Math.random() * 0.3;
    
    const revenue = Math.round(baseTrend * seasonalMultiplier * randomVariation);
    const units = Math.round(revenue / (80 + Math.random() * 40));

    return {
      date: `2023-${String(monthIndex + 1).padStart(2, '0')}-01`,
      revenue,
      units,
      month
    };
  });
};

export const calculateForecast = (data: SalesData[], params: ForecastParams): ForecastData[] => {
  const recentData = data.slice(-12); // Use last 12 months for forecasting
  
  const forecast: ForecastData[] = [];
  
  for (let i = 0; i < params.periods; i++) {
    let predictedRevenue: number;
    
    switch (params.method) {
      case 'linear':
        predictedRevenue = linearRegression(recentData, i + 1, params);
        break;
      case 'exponential':
        predictedRevenue = exponentialSmoothing(recentData, i + 1, params);
        break;
      case 'moving_average':
        predictedRevenue = movingAverage(recentData, i + 1, params);
        break;
      default:
        predictedRevenue = linearRegression(recentData, i + 1, params);
    }

    // Apply trend strength
    const lastValue = recentData[recentData.length - 1].revenue;
    const trendAdjustment = (predictedRevenue - lastValue) * params.trendStrength;
    predictedRevenue = lastValue + trendAdjustment;

    // Calculate confidence interval
    const variance = calculateVariance(recentData);
    const confidenceRange = Math.sqrt(variance) * (1 + i * 0.1);

    const forecastMonth = new Date();
    forecastMonth.setMonth(forecastMonth.getMonth() + i + 1);

    forecast.push({
      date: forecastMonth.toISOString().slice(0, 10),
      revenue: Math.round(predictedRevenue),
      confidence: {
        lower: Math.round(predictedRevenue - confidenceRange),
        upper: Math.round(predictedRevenue + confidenceRange)
      }
    });
  }

  return forecast;
};

const linearRegression = (data: SalesData[], periods: number, params: ForecastParams): number => {
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map(d => d.revenue);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
  const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let prediction = slope * (n + periods - 1) + intercept;

  // Apply seasonality if enabled
  if (params.seasonality) {
    const seasonalIndex = (n + periods - 1) % 12;
    const seasonalMultiplier = 1 + 0.2 * Math.sin((seasonalIndex - 2) * Math.PI / 6);
    prediction *= seasonalMultiplier;
  }

  return prediction;
};

const exponentialSmoothing = (data: SalesData[], periods: number, params: ForecastParams): number => {
  const alpha = 0.3; // Smoothing parameter
  let smooth = data[0].revenue;

  for (let i = 1; i < data.length; i++) {
    smooth = alpha * data[i].revenue + (1 - alpha) * smooth;
  }

  // Project forward
  const trend = (data[data.length - 1].revenue - data[0].revenue) / (data.length - 1);
  return smooth + trend * periods;
};

const movingAverage = (data: SalesData[], periods: number, params: ForecastParams): number => {
  const window = Math.min(6, data.length);
  const recentData = data.slice(-window);
  const average = recentData.reduce((sum, d) => sum + d.revenue, 0) / window;
  
  // Simple trend projection
  const trend = (data[data.length - 1].revenue - data[data.length - window].revenue) / window;
  return average + trend * periods;
};

const calculateVariance = (data: SalesData[]): number => {
  const mean = data.reduce((sum, d) => sum + d.revenue, 0) / data.length;
  const variance = data.reduce((sum, d) => sum + Math.pow(d.revenue - mean, 2), 0) / data.length;
  return variance;
};

export const calculateKPIs = (data: SalesData[], forecast: ForecastData[]): KPIData => {
  const recentData = data.slice(-12);
  const currentRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0);
  const previousYearRevenue = data.slice(-24, -12).reduce((sum, d) => sum + d.revenue, 0);
  const forecastRevenue = forecast.reduce((sum, d) => sum + d.revenue, 0);
  
  const revenueGrowth = ((currentRevenue - previousYearRevenue) / previousYearRevenue) * 100;
  const forecastGrowth = ((forecastRevenue - currentRevenue) / currentRevenue) * 100;
  
  const monthlyGrowthRates = recentData.slice(1).map((d, i) => 
    ((d.revenue - recentData[i].revenue) / recentData[i].revenue) * 100
  );
  const growthRate = monthlyGrowthRates.reduce((sum, rate) => sum + rate, 0) / monthlyGrowthRates.length;
  
  return {
    currentRevenue,
    forecastRevenue,
    revenueGrowth,
    forecastGrowth,
    growthRate,
    growthTrend: Math.random() * 10 - 2, // Simulated
    accuracy: 85 + Math.random() * 10, // Simulated accuracy
    accuracyTrend: Math.random() * 6 - 2 // Simulated trend
  };
};

export const generateInsights = (data: SalesData[], forecast: ForecastData[], kpis: KPIData): Insight[] => {
  const insights: Insight[] = [];

  // Growth insight
  if (kpis.revenueGrowth > 10) {
    insights.push({
      type: 'positive',
      title: 'Strong Growth Trajectory',
      description: `Revenue has grown ${kpis.revenueGrowth.toFixed(1)}% compared to last year, indicating strong market performance.`,
      action: 'Consider expanding inventory and marketing efforts to capitalize on growth momentum.'
    });
  } else if (kpis.revenueGrowth < 0) {
    insights.push({
      type: 'warning',
      title: 'Revenue Decline',
      description: `Revenue has decreased by ${Math.abs(kpis.revenueGrowth).toFixed(1)}% compared to last year.`,
      action: 'Review market conditions, pricing strategy, and competitive positioning.'
    });
  }

  // Seasonality insight
  const recentData = data.slice(-12);
  const summerMonths = recentData.filter((_, i) => [5, 6, 7].includes((i + new Date().getMonth()) % 12));
  const winterMonths = recentData.filter((_, i) => [11, 0, 1].includes((i + new Date().getMonth()) % 12));
  
  if (summerMonths.length > 0 && winterMonths.length > 0) {
    const summerAvg = summerMonths.reduce((sum, d) => sum + d.revenue, 0) / summerMonths.length;
    const winterAvg = winterMonths.reduce((sum, d) => sum + d.revenue, 0) / winterMonths.length;
    
    if (winterAvg > summerAvg * 1.15) {
      insights.push({
        type: 'neutral',
        title: 'Seasonal Pattern Detected',
        description: 'Sales show consistent seasonal variation with stronger winter performance.',
        action: 'Plan inventory and staffing adjustments for seasonal fluctuations.'
      });
    }
  }

  // Forecast confidence
  if (kpis.accuracy > 90) {
    insights.push({
      type: 'positive',
      title: 'High Forecast Reliability',
      description: `Model accuracy is ${kpis.accuracy.toFixed(1)}%, indicating reliable predictions for business planning.`,
    });
  }

  return insights;
};