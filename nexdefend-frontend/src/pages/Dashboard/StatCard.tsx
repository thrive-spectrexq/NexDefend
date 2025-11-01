interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center">
      <div className="text-blue-400 mr-6">{icon}</div>
      <div>
        <p className="text-sm text-gray-400 uppercase">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
