import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import Footer from '../components/landing/Footer';
import Header from '../components/landing/Header';
import './HomePage.css';

const HomePage = () => {
  // Removed all sidebar state and handlers

  return (
    <div className="homepage">
      {/* Removed onOpenSidebar prop */}
      <Header />
      <Hero />
      <FeaturesGrid />
      <Footer />
      {/* Removed Sidebar and backdrop elements */}
    </div>
  );
};

export default HomePage;
