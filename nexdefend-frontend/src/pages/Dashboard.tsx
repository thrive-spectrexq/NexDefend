import useAuthStore from '../stores/authStore';
import './Dashboard.css';

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={logout} className="btn btn-danger">Logout</button>
      </div>
      <div className="widgets-grid">
        <div className="widget">
          <h2>Alerts Overview</h2>
          <p>Chart or summary of recent alerts.</p>
        </div>
        <div className="widget">
          <h2>Incidents Status</h2>
          <p>Summary of active and resolved incidents.</p>
        </div>
        <div className="widget">
          <h2>System Health</h2>
          <p>Metrics on system performance and health.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
