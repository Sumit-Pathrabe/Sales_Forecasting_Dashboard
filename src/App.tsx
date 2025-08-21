import React, { useState, useMemo } from 'react';
import { LineChart, BarChart3, TrendingUp, Calendar, Download, Upload, Target, AlertTriangle, Database } from 'lucide-react';
import { SalesChart } from './components/SalesChart';
import { ForecastChart } from './components/ForecastChart';
import { KPICard } from './components/KPICard';
import { InsightsPanel } from './components/InsightsPanel';
import { ForecastControls } from './components/ForecastControls';
import { DatasetUpload } from './components/DatasetUpload';
import { generateSampleData, calculateForecast, calculateKPIs, generateInsights } from './utils/analytics';
import type { SalesData, ForecastParams } from './types';

function App() {
  const [salesData, setSalesData] = useState<SalesData[]>(() => generateSampleData());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dataSource, setDataSource] = useState<'sample' | 'imported'>('sample');
  const [forecastParams, setForecastParams] = useState<ForecastParams>({
    periods: 12,
    seasonality: true,
    trendStrength: 0.8,
    method: 'linear'
  });

  const forecast = useMemo(() => 
    calculateForecast(salesData, forecastParams), 
    [salesData, forecastParams]
  );

  const kpis = useMemo(() => 
    calculateKPIs(salesData, forecast), 
    [salesData, forecast]
  );

  const insights = useMemo(() => 
    generateInsights(salesData, forecast, kpis), 
    [salesData, forecast, kpis]
  );

  const handleDataImport = (importedData: SalesData[]) => {
    setSalesData(importedData);
    setDataSource('imported');
    setShowUploadModal(false);
  };

  const handleUseSampleData = () => {
    setSalesData(generateSampleData());
    setDataSource('sample');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Forecasting Dashboard</h1>
                <p className="text-sm text-gray-600">Interactive sales prediction with ML insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Dataset</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-sm min-h-screen">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Source</h2>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                dataSource === 'sample' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Sample Data</span>
                  </div>
                  {dataSource === 'sample' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">24 months of demo sales data</p>
                {dataSource !== 'sample' && (
                  <button
                    onClick={handleUseSampleData}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Switch to sample data
                  </button>
                )}
              </div>
              
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                dataSource === 'imported' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Your Dataset</span>
                  </div>
                  {dataSource === 'imported' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dataSource === 'imported' 
                    ? `${salesData.length} records imported` 
                    : 'Import your CSV data'
                  }
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  {dataSource === 'imported' ? 'Import new dataset' : 'Upload CSV file'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Forecast Settings</h2>
            <ForecastControls 
              params={forecastParams} 
              onChange={setForecastParams} 
            />
          </div>

          <div className="p-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h2>
            <InsightsPanel insights={insights} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Current Revenue"
              value={kpis.currentRevenue}
              change={kpis.revenueGrowth}
              icon={<BarChart3 className="w-5 h-5" />}
              format="currency"
            />
            <KPICard
              title="Forecast Revenue"
              value={kpis.forecastRevenue}
              change={kpis.forecastGrowth}
              icon={<TrendingUp className="w-5 h-5" />}
              format="currency"
            />
            <KPICard
              title="Growth Rate"
              value={kpis.growthRate}
              change={kpis.growthTrend}
              icon={<Target className="w-5 h-5" />}
              format="percent"
            />
            <KPICard
              title="Forecast Accuracy"
              value={kpis.accuracy}
              change={kpis.accuracyTrend}
              icon={<LineChart className="w-5 h-5" />}
              format="percent"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Historical Sales Data</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Last 24 months</span>
                </div>
              </div>
              <SalesChart data={salesData} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sales Forecast</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Next {forecastParams.periods} months</span>
                </div>
              </div>
              <ForecastChart historicalData={salesData} forecastData={forecast} />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Planning Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Growth Opportunity</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Strong upward trend detected. Consider increasing inventory by 15% for Q2.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Seasonal Pattern</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Historical data shows 20% dip in summer months. Plan marketing campaigns accordingly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Target Achievement</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      On track to exceed annual target by 8%. Consider setting higher goals for next year.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <DatasetUpload
          onDataImported={handleDataImport}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}

export default App;