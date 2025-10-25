import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const API_URL = process.env.REACT_APP_API_URL;

interface Metric {
  id: number;
  metric_type: string;
  value: number;
  timestamp: string;
}

const MetricsDashboard: React.FC = () => {
  const [cpuData, setCpuData] = useState<Metric[]>([]);
  const [memData, setMemData] = useState<Metric[]>([]);
  const [diskData, setDiskData] = useState<Metric[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let from: Date;

        switch (timeRange) {
          case '1h':
            from = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case '6h':
            from = new Date(now.getTime() - 6 * 60 * 60 * 1000);
            break;
          case '24h':
            from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          default:
            from = new Date(now.getTime() - 60 * 60 * 1000);
        }

        const to = now;

        const [cpuRes, memRes, diskRes] = await Promise.all([
          fetch(`${API_URL}/metrics?type=cpu_load&from=${from.toISOString()}&to=${to.toISOString()}`),
          fetch(`${API_URL}/metrics?type=memory_usage&from=${from.toISOString()}&to=${to.toISOString()}`),
          fetch(`${API_URL}/metrics?type=disk_usage&from=${from.toISOString()}&to=${to.toISOString()}`),
        ]);

        if (!cpuRes.ok || !memRes.ok || !diskRes.ok)
          throw new Error("Failed to fetch data");

        setCpuData(await cpuRes.json());
        setMemData(await memRes.json());
        setDiskData(await diskRes.json());
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Fetch every 30 seconds

    return () => clearInterval(intervalId);
  }, [timeRange]);

  const createChartData = (data: Metric[], label: string, color: string) => {
    return {
      labels: data.map((metric) => new Date(metric.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: label,
          data: data.map((metric) => metric.value),
          borderColor: color,
          fill: false,
        },
      ],
    };
  };

  return (
    <div className="p-5 font-sans">
      <h2 className="text-4xl mb-5 text-gray-800">System Metrics</h2>
      <div className="mb-5">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 rounded-md border border-gray-300"
        >
          <option value="1h">Last 1 Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>
      {loading ? (
        <p>Loading data...</p>
      ) : fetchError ? (
        <p className="text-red-500 text-xl mb-5">{fetchError}</p>
      ) : (
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">CPU Load (%)</h3>
            <Line data={createChartData(cpuData, 'CPU Load', '#FF6384')} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">Memory Usage (%)</h3>
            <Line data={createChartData(memData, 'Memory Usage', '#36A2EB')} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">Disk Usage (%)</h3>
            <Line data={createChartData(diskData, 'Disk Usage', '#FFCE56')} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
