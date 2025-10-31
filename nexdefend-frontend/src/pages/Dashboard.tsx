const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder Widgets */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Alerts Overview</h2>
          <p>Chart or summary of recent alerts.</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Incidents Status</h2>
          <p>Summary of active and resolved incidents.</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">System Health</h2>
          <p>Metrics on system performance and health.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
