import { Outlet } from 'react-router-dom'
import Header from '../components/organisms/Header'
import SideNav from '../components/organisms/SideNav'

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* This Header will now contain the user info and logout button */}
        <Header /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
