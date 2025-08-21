import React from 'react';
import { Settings } from 'lucide-react';
import type { ForecastParams } from '../types';

interface ForecastControlsProps {
  params: ForecastParams;
  onChange: (params: ForecastParams) => void;
}

export const ForecastControls: React.FC<ForecastControlsProps> = ({ params, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600 mb-4">
        <Settings className="w-4 h-4" />
        <span className="font-medium">Configuration</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forecast Periods
        </label>
        <input
          type="range"
          min="3"
          max="24"
          value={params.periods}
          onChange={(e) => onChange({ ...params, periods: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>3 months</span>
          <span className="font-medium">{params.periods} months</span>
          <span>24 months</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forecast Method
        </label>
        <select
          value={params.method}
          onChange={(e) => onChange({ ...params, method: e.target.value as ForecastParams['method'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="linear">Linear Regression</option>
          <option value="exponential">Exponential Smoothing</option>
          <option value="moving_average">Moving Average</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trend Strength
        </label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={params.trendStrength}
          onChange={(e) => onChange({ ...params, trendStrength: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Conservative</span>
          <span className="font-medium">{params.trendStrength.toFixed(1)}</span>
          <span>Aggressive</span>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={params.seasonality}
            onChange={(e) => onChange({ ...params, seasonality: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">Include Seasonality</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Account for seasonal patterns in historical data
        </p>
      </div>
    </div>
  );
};