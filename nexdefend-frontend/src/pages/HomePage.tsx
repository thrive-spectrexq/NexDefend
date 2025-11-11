import { useState } from 'react';
import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Footer from '../components/landing/Footer';
import Header from '../components/landing/Header';
import Sidebar from '../components/common/Sidebar';
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
      <FeaturesGrid />
      <Footer />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      {isSidebarOpen && <div className="backdrop" onClick={handleCloseSidebar}></div>}
    </div>
  );
};

export default HomePage;
