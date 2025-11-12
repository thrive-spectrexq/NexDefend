import { Outlet } from 'react-router-dom'

const AppLayout = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
