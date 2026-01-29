import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResourceGaugeProps {
  value: number;
  label: string;
  color?: string; // Optional override, otherwise dynamic
}

export const ResourceGauge = ({ value, label, color }: ResourceGaugeProps) => {
  // Dynamic color logic: Green < 60% < Yellow < 90% < Red
  const getColor = (val: number) => {
      if (color) return color;
      if (val < 60) return '#10b981'; // Green
      if (val < 90) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
  };

  const activeColor = getColor(value);

  const data = [
    { value: value },
    { value: 100 - value }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="relative h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={50}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={activeColor} className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
           <span className="text-xl font-bold font-mono text-white drop-shadow-md">{value}%</span>
        </div>
      </div>
      <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider mt-1">{label}</span>
      {/* Glow effect based on color */}
      <div
        className="absolute inset-0 rounded-full opacity-10 pointer-events-none blur-xl"
        style={{ background: activeColor }}
      />
    </div>
  );
};
