import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import PublicRoute from './layouts/PublicRoute'
import HomePage from './pages/HomePage'
import { ConsoleLayout } from './layouts/ConsoleLayout'
import CommandDashboard from './pages/console/CommandDashboard'
import DetectionsQueue from './pages/console/DetectionsQueue'
import HostManagement from './pages/console/HostManagement'
import HostDetails from './pages/console/HostDetails'
import InvestigationView from './pages/console/InvestigationView'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* New Console Routes - Replacing old Dashboard */}
        {/* We can treat this as PrivateRoute eventually, but for now hooking it up directly to visualize */}
        <Route path="/dashboard" element={<ConsoleLayout />}>
            <Route index element={<CommandDashboard />} />
            <Route path="detections" element={<DetectionsQueue />} />
            <Route path="hosts" element={<HostManagement />} />
            <Route path="hosts/:id" element={<HostDetails />} />
            <Route path="investigate" element={<InvestigationView />} />
            {/* Fallbacks or placeholders for other links */}
            <Route path="config" element={<div className="p-4 text-text">Configuration View Coming Soon</div>} />
            <Route path="support" element={<div className="p-4 text-text">Support View Coming Soon</div>} />
        </Route>

        {/* Redirect legacy routes if necessary or just let 404s happen for now */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
