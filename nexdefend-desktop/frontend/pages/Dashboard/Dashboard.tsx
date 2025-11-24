import { Outlet } from 'react-router-dom';
import Header from '../../components/organisms/Header';
import SideNav from '../../components/organisms/SideNav';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
