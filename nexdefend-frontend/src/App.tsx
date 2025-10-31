import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Alerts from './pages/Alerts/Alerts';
import Vulnerabilities from './pages/Vulnerabilities/Vulnerabilities';
import Settings from './pages/Settings/Settings';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const showNavbar = isAuthenticated && !['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
