import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Threat } from '../../api/apiClient';

interface AlertsBarChartProps {
  data: Threat[];
}

const processThreatsForBarChart = (threats: Threat[]) => {
  const alertsByCategory: { [key: string]: number } = {};
  threats.forEach(threat => {
    const category = threat.alert_category || 'Unknown';
    if (alertsByCategory[category]) {
      alertsByCategory[category]++;
    } else {
      alertsByCategory[category] = 1;
    }
  });
  return Object.entries(alertsByCategory).map(([name, value]) => ({ name, value }));
};

const AlertsBarChart = ({ data }: AlertsBarChartProps) => {
  const chartData = processThreatsForBarChart(data);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-4">Alert Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AlertsBarChart;
