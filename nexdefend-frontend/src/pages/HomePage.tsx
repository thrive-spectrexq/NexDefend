import { useState } from 'react';
import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Footer from '../components/landing/Footer';
import Header from '../components/landing/Header';
import Partners from '../components/landing/Partners';
import Metrics from '../components/landing/Metrics';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import WhyOpenSource from '../components/landing/WhyOpenSource';
import FeatureSection from '../components/landing/FeatureSection';
import Sidebar from '../components/common/Sidebar';
import dashboardPreview from '../assets/dashboard-preview.png';
import './HomePage.css';

const HomePage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="homepage">
      <Header onOpenSidebar={handleOpenSidebar} />
      <Hero onOpenSidebar={handleOpenSidebar} />
      <Partners />
      <FeaturesGrid />
      <FeatureSection
        title="Active XDR protection from modern threats"
        description="NexDefend provides analysts real-time correlation and context. Active responses are granular, encompassing on-device remediation so endpoints are kept clean and operational."
        image={dashboardPreview}
        imageAlt="Active XDR Protection"
      />
      <FeatureSection
        title="A comprehensive SIEM solution"
        description="The NexDefend Security Information and Event Management (SIEM) solution provides monitoring, detection, and alerting of security events and incidents."
        image={dashboardPreview}
        imageAlt="SIEM Solution"
        reverse
      />
      <WhyOpenSource />
      <Metrics />
      <Testimonials />
      <FAQ />
      <Footer />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      {isSidebarOpen && <div className="backdrop" onClick={handleCloseSidebar}></div>}
    </div>
  );
};

export default HomePage;
