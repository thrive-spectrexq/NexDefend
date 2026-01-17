import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResourceGaugeProps {
  value: number;
  label: string;
  color?: string;
}

export const ResourceGauge = ({ value, label, color = "#06b6d4" }: ResourceGaugeProps) => {
  const data = [
    { value: value },
    { value: 100 - value }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={55}
              startAngle={180}
              endAngle={0}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <Cell fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1 text-center">
           <span className="text-2xl font-bold font-mono text-white block">{value}%</span>
        </div>
      </div>
      <span className="text-gray-400 font-mono text-sm uppercase tracking-wider -mt-4">{label}</span>
    </div>
  );
};
