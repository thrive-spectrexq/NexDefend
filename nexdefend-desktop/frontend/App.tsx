import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Alerts from './pages/Alerts'
import Dashboard from './pages/Dashboard/Dashboard'
import Incidents from './pages/Incidents'
import Login from './pages/Login'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Vulnerabilities from './pages/Vulnerabilities'
import PrivateRoute from './layouts/PrivateRoute'
import PublicRoute from './layouts/PublicRoute'
import HomePage from './pages/HomePage'
import AIDashboardPage from './pages/AIDashboardPage'
import AlertTriage from './pages/AlertTriage'
import SOARPlaybookEditor from './pages/SOARPlaybookEditor'
import SecurityOverview from './pages/SecurityOverview'
import NetworkDashboard from './pages/NetworkDashboard'
import PlatformHealth from './pages/PlatformHealth'
import DashboardIndex from './pages/Dashboard/DashboardIndex'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardIndex />} />
            <Route path="ai-dashboard" element={<AIDashboardPage />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="alert-triage" element={<AlertTriage />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="settings" element={<Settings />} />
            <Route path="soar" element={<SOARPlaybookEditor />} />
            <Route path="security-overview" element={<SecurityOverview />} />
            <Route path="network-dashboard" element={<NetworkDashboard />} />
            <Route path="platform-health" element={<PlatformHealth />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
