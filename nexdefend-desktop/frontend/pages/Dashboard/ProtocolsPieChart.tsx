import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Threat } from '../../api/apiClient';

interface ProtocolsPieChartProps {
  data: Threat[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const processThreatsForPieChart = (threats: Threat[]) => {
  const protocols: { [key: string]: number } = {};
  threats.forEach(threat => {
    const protocol = threat.protocol || 'Unknown';
    if (protocols[protocol]) {
      protocols[protocol]++;
    } else {
      protocols[protocol] = 1;
    }
  });
  return Object.entries(protocols).map(([name, value]) => ({ name, value }));
};

const ProtocolsPieChart = ({ data }: ProtocolsPieChartProps) => {
  const chartData = processThreatsForPieChart(data);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-4">Protocol Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProtocolsPieChart;
