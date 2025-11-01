import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import FeatureSection from '../components/landing/FeatureSection';
import Footer from '../components/landing/Footer';
import Header from '../components/landing/Header';
import Partners from '../components/landing/Partners';
import Metrics from '../components/landing/Metrics';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <Partners />
      <FeaturesGrid />
      <FeatureSection
        title="A comprehensive SIEM solution"
        description="The NexDefend Security Information and Event Management (SIEM) solution provides monitoring, detection, and alerting of security events and incidents."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=SIEM+Solution"
        imageAlt="SIEM Solution"
      />
      <FeatureSection
        title="Explore the potential of NexDefend Cloud"
        description="The NexDefend Cloud service offers managed, ready-to-use, and highly scalable cloud environments for security monitoring and endpoint protection."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=NexDefend+Cloud"
        imageAlt="NexDefend Cloud"
        reverse
      />
      <Metrics />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default HomePage;
