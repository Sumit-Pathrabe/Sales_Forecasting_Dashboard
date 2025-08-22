interface DashboardProps {
  dataSource: any[];
  salesData: any[];
  forecastParams: any;
  forecast: any[];
  kpis: any[];
  insights: string[];
  showUploadModal: boolean;
  handleUseSampleData: () => void;
  handleDataImport: (file: File) => void;
  setShowUploadModal: (show: boolean) => void;
  setForecastParams: (params: any) => void;
}

export default function Dashboard({
  dataSource,
  salesData,
  forecastParams,
  forecast,
  kpis,
  insights,
  showUploadModal,
  handleUseSampleData,
  handleDataImport,
  setShowUploadModal,
  setForecastParams,
}: DashboardProps) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <button onClick={handleUseSampleData}>Use Sample Data</button>

      <section>
        <h2>KPIs</h2>
        <ul>
          {kpis.map((kpi, idx) => (
            <li key={idx}>
              {kpi.title}: {kpi.value}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Insights</h2>
        <ul>
          {insights.map((insight, idx) => (
            <li key={idx}>{insight}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
