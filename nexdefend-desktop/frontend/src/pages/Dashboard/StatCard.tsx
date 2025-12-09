import { Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex items-center transition-all duration-300 hover:bg-gray-700 hover:shadow-lg border-t-4 border-t-blue-600">
      <div className="bg-blue-600/20 text-blue-400 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 uppercase font-medium">{title}</p>
        {isLoading ? (
          <Loader2 size={28} className="animate-spin mt-1" />
        ) : (
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        )}
      </div>
    </div>
  );
};

export default StatCard;
