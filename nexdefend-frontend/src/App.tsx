import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Alerts from './pages/Alerts/Alerts';
import Vulnerabilities from './pages/Vulnerabilities/Vulnerabilities';
import Settings from './pages/Settings/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex bg-gray-900 text-white">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
