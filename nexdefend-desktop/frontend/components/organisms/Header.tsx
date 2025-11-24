import { Search, Bell, User, LogOut } from 'lucide-react'
import useAuthStore from '../../stores/authStore'

const Header = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center space-x-8">
        <h1 className="text-2xl font-bold text-blue-400">NexDefend</h1>
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search for alerts, IPs, incidents..."
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 md:w-96"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            <User size={16} /> {/* Placeholder for user initial or avatar */}
          </span>
          <span className="text-sm font-medium hidden md:block">User</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Header
