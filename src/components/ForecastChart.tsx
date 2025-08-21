import React from 'react';
import type { SalesData, ForecastData } from '../types';

interface ForecastChartProps {
  historicalData: SalesData[];
  forecastData: ForecastData[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ historicalData, forecastData }) => {
  const lastHistorical = historicalData.slice(-6); // Show last 6 months for context
  const allData = [...lastHistorical.map(d => ({ ...d, type: 'historical' })), 
                   ...forecastData.map(d => ({ ...d, type: 'forecast' }))];
  
  const maxRevenue = Math.max(
    ...lastHistorical.map(d => d.revenue),
    ...forecastData.map(d => Math.max(d.revenue, d.confidence.upper))
  );
  const minRevenue = Math.min(
    ...lastHistorical.map(d => d.revenue),
    ...forecastData.map(d => Math.min(d.revenue, d.confidence.lower))
  );
  const range = maxRevenue - minRevenue;
  
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 40;
  
  const getY = (value: number) => {
    return chartHeight - padding - ((value - minRevenue) / range) * (chartHeight - 2 * padding);
  };
  
  const getX = (index: number) => {
    return padding + (index / (allData.length - 1)) * (chartWidth - 2 * padding);
  };

  const historicalPath = lastHistorical
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.revenue)}`)
    .join(' ');

  const forecastPath = forecastData
    .map((d, i) => {
      const x = getX(lastHistorical.length - 1 + i);
      const y = getY(d.revenue);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const confidencePath = forecastData.map((d, i) => {
    const x = getX(lastHistorical.length - 1 + i);
    return `${x},${getY(d.confidence.upper)}`;
  }).join(' L ') + ' ' +
  forecastData.slice().reverse().map((d, i) => {
    const x = getX(lastHistorical.length - 1 + (forecastData.length - 1 - i));
    return `${x},${getY(d.confidence.lower)}`;
  }).join(' L ');

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (chartHeight - 2 * padding)}
            x2={chartWidth - padding}
            y2={padding + ratio * (chartHeight - 2 * padding)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* Confidence interval */}
        <path
          d={`M ${confidencePath} Z`}
          fill="url(#confidenceGradient)"
        />
        
        {/* Historical line */}
        <path
          d={historicalPath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Forecast line */}
        <path
          d={forecastPath}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeDasharray="5,5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Connection point */}
        <circle
          cx={getX(lastHistorical.length - 1)}
          cy={getY(lastHistorical[lastHistorical.length - 1].revenue)}
          r="4"
          fill="#3B82F6"
        />
        
        {/* Forecast points */}
        {forecastData.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(lastHistorical.length - 1 + i)}
              cy={getY(d.revenue)}
              r="4"
              fill="#F59E0B"
              className="hover:r-6 cursor-pointer transition-all"
            />
            <title>
              {`Forecast: $${d.revenue.toLocaleString()} (±${Math.round((d.confidence.upper - d.confidence.lower) / 2).toLocaleString()})`}
            </title>
          </g>
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = minRevenue + ratio * range;
          return (
            <text
              key={i}
              x={padding - 10}
              y={padding + (1 - ratio) * (chartHeight - 2 * padding)}
              textAnchor="end"
              dy="0.35em"
              fontSize="12"
              fill="#6B7280"
            >
              ${Math.round(value / 1000)}k
            </text>
          );
        })}
        
        {/* Legend */}
        <g transform={`translate(${chartWidth - 150}, ${padding})`}>
          <rect x="0" y="0" width="140" height="60" fill="white" stroke="#E5E7EB" rx="4" />
          <line x1="10" y1="15" x2="30" y2="15" stroke="#3B82F6" strokeWidth="3" />
          <text x="35" y="19" fontSize="12" fill="#374151">Historical</text>
          <line x1="10" y1="35" x2="30" y2="35" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3,3" />
          <text x="35" y="39" fontSize="12" fill="#374151">Forecast</text>
          <rect x="10" y="45" width="20" height="8" fill="url(#confidenceGradient)" />
          <text x="35" y="52" fontSize="12" fill="#374151">Confidence</text>
        </g>
      </svg>
    </div>
  );
};