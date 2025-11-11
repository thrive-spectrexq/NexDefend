import { Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center">
      <div className="text-blue-400 mr-6">{icon}</div>
      <div>
        <p className="text-sm text-gray-400 uppercase">{title}</p>
        {isLoading ? (
          <Loader2 size={32} className="animate-spin mt-1" />
        ) : (
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        )}
      </div>
    </div>
  );
};

export default StatCard;
