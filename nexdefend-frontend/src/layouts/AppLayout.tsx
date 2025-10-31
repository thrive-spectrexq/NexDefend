import { Outlet } from 'react-router-dom'
import Header from '../components/organisms/Header'
import SideNav from '../components/organisms/SideNav'

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
