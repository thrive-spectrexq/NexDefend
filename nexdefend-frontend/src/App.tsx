import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
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
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
