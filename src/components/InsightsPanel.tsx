import React from 'react';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { Insight } from '../types';

interface InsightsPanelProps {
  insights: Insight[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBorderColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-amber-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-4 bg-gray-50 rounded-lg border-l-4 ${getBorderColor(insight.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {insight.title}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {insight.description}
              </p>
              {insight.action && (
                <p className="text-sm font-medium text-blue-600">
                  Action: {insight.action}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};