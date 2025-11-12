import { NavLink } from 'react-router-dom'
import {
  Shield,
  AlertTriangle,
  FileText,
  Settings,
  BarChart,
  BrainCircuit,
  ShieldAlert,
} from 'lucide-react'

// Define the nav items
const navItems = [
  { to: "/dashboard", icon: <BarChart size={20} />, text: "Dashboard", end: true },
  { to: "/dashboard/ai-dashboard", icon: <BrainCircuit size={20} />, text: "AI Dashboard" },
  { to: "/dashboard/alerts", icon: <AlertTriangle size={20} />, text: "Alerts" },
  { to: "/dashboard/incidents", icon: <ShieldAlert size={20} />, text: "Incidents" },
  { to: "/dashboard/reports", icon: <FileText size={20} />, text: "Reports" },
  { to: "/dashboard/vulnerabilities", icon: <Shield size={20} />, text: "Vulnerabilities" },
];

const SideNav = () => {
  const activeClass = "flex items-center space-x-3 p-2 rounded-md bg-gray-700 text-white transition-colors";
  const inactiveClass = "flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors";

  return (
    <nav className="bg-gray-900 text-white w-64 p-4 flex-col border-r border-gray-700 hidden md:flex">
      <div className="mb-8">
        <NavLink to="/dashboard" className="flex items-center space-x-2">
          <Shield size={28} className="text-blue-500" />
          <span className="text-2xl font-bold">NexDefend</span>
        </NavLink>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end} // Ensures "Dashboard" is only active when on that exact page
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              {item.icon}
              <span>{item.text}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default SideNav
