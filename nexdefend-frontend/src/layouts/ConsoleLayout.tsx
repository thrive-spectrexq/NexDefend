import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/console/Sidebar';
import { TopBar } from '../components/console/TopBar';
import { ToastContainer } from '../components/common/ToastContainer';

export function ConsoleLayout() {
  return (
    <div className="flex h-screen bg-background text-text overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
