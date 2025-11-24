import type { Threat } from '../../api/apiClient';
import { Loader2 } from 'lucide-react';

interface ChartCardProps {
  title: string;
  data: Threat[];
  isLoading: boolean;
}

// ... (processThreatsForChart function is unchanged)
const processThreatsForChart = (threats: Threat[]) => {
  const alertsByDay: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  threats.forEach(threat => {
    const threatDate = new Date(threat.timestamp);
    if (threatDate > sevenDaysAgo) {
      const dayName = dayMap[threatDate.getDay()];
      alertsByDay[dayName]++;
    }
  });
  return Object.entries(alertsByDay).map(([day, alerts]) => ({ day, alerts }));
};

const ChartCard = ({ title, data, isLoading }: ChartCardProps) => {
  const chartData = processThreatsForChart(data);
  const maxValue = Math.max(...chartData.map(d => d.alerts), 1); // Use 1 to avoid divide by zero

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="flex justify-around items-end h-72 pt-4 px-2"> {/* Increased height */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 size={40} className="animate-spin" />
          </div>
        ) : (
          chartData.map((data, index) => (
            <div className="flex flex-col items-center h-full w-1/12" key={index}>
              <div
                className="bg-gradient-to-t from-blue-600 to-blue-400 hover:opacity-80 transition-all rounded-t-md w-full"
                style={{ height: `${(data.alerts / maxValue) * 100}%` }}
                title={`${data.day}: ${data.alerts} alerts`}
              ></div>
              <span className="text-xs text-gray-400 mt-2">{data.day}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChartCard;
