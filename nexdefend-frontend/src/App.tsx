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
import Settings from './pages/Settings'
import ProcessExplorer from './pages/ProcessExplorer'
import AIDashboardPage from './pages/AIDashboardPage'
import Support from './pages/console/Support'
import Alerts from './pages/Alerts'
import AlertTriage from './pages/AlertTriage'
import Reports from './pages/Reports'
import SOARPlaybookEditor from './pages/SOARPlaybookEditor'
import NetworkTopology from './pages/NetworkTopology'
import PlatformHealth from './pages/console/PlatformHealth'
import SecurityOverview from './pages/SecurityOverview'
import Vulnerabilities from './pages/Vulnerabilities'
import Incidents from './pages/Incidents'

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
            <Route path="ai-dashboard" element={<AIDashboardPage />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="triage" element={<AlertTriage />} />
            <Route path="detections" element={<DetectionsQueue />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="hosts" element={<HostManagement />} />
            <Route path="hosts/:id" element={<HostDetails />} />
            <Route path="network" element={<NetworkTopology />} />
            <Route path="processes" element={<ProcessExplorer />} />
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="investigate" element={<InvestigationView />} />
            <Route path="soar" element={<SOARPlaybookEditor />} />
            <Route path="reports" element={<Reports />} />
            <Route path="security" element={<SecurityOverview />} />
            <Route path="health" element={<PlatformHealth />} />
            <Route path="config" element={<Settings />} />
            <Route path="support" element={<Support />} />
        </Route>

        {/* Redirect legacy routes if necessary or just let 404s happen for now */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
