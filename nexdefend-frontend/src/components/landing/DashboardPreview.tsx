import './DashboardPreview.css';
import dashboardPreview from '../../assets/dashboard-preview.png';

const DashboardPreview = () => {
  return (
    <section className="dashboard-preview-section py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Dashboard & Monitoring Previews</h2>
        <div className="relative">
          <img src={dashboardPreview} alt="Dashboard Preview" className="rounded-lg" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <p className="text-2xl font-bold">Live Demo Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
