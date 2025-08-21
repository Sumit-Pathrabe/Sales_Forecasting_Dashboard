import React from 'react';
import type { SalesData } from '../types';

interface SalesChartProps {
  data: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const range = maxRevenue - minRevenue;
  
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 40;
  
  const getY = (value: number) => {
    return chartHeight - padding - ((value - minRevenue) / range) * (chartHeight - 2 * padding);
  };
  
  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
  };

  const pathData = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.revenue)}`)
    .join(' ');

  const areaData = `${pathData} L ${getX(data.length - 1)} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
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
        
        {/* Area */}
        <path
          d={areaData}
          fill="url(#salesGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.revenue)}
              r="4"
              fill="#3B82F6"
              className="hover:r-6 cursor-pointer transition-all"
            />
            <title>{`${d.month}: $${d.revenue.toLocaleString()}`}</title>
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
        
        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i, filtered) => {
          const originalIndex = data.indexOf(d);
          return (
            <text
              key={originalIndex}
              x={getX(originalIndex)}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
            >
              {d.month.slice(0, 3)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};