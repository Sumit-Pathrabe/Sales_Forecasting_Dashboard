import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  format: 'currency' | 'percent' | 'number';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, format }) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${changeBg}`}>
          {isPositive ? (
            <TrendingUp className={`w-3 h-3 ${changeColor}`} />
          ) : (
            <TrendingDown className={`w-3 h-3 ${changeColor}`} />
          )}
          <span className={`text-xs font-medium ${changeColor}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {formatValue(value, format)}
        </h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};