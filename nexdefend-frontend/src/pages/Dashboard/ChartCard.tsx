const mockChartData = [
  { day: 'Mon', alerts: 12 },
  { day: 'Tue', alerts: 19 },
  { day: 'Wed', alerts: 8 },
  { day: 'Thu', alerts: 24 },
  { day: 'Fri', alerts: 15 },
  { day: 'Sat', alerts: 30 },
  { day: 'Sun', alerts: 22 },
];

interface ChartCardProps {
  title: string;
}

const ChartCard = ({ title }: ChartCardProps) => {
  const maxValue = Math.max(...mockChartData.map(d => d.alerts), 0);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="flex justify-around items-end h-64 pt-4">
        {mockChartData.map((data, index) => (
          <div className="flex flex-col items-center h-full w-1/12" key={index}>
            <div
              className="bg-blue-400 hover:bg-blue-500 rounded-t-md w-full"
              style={{ height: `${(data.alerts / maxValue) * 100}%` }}
              title={`${data.day}: ${data.alerts} alerts`}
            ></div>
            <span className="text-xs text-gray-400 mt-2">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCard;
