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
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <Partners />
      <FeaturesGrid />
      <FeatureSection
        title="Active XDR protection from modern threats"
        description="NexDefend provides analysts real-time correlation and context. Active responses are granular, encompassing on-device remediation so endpoints are kept clean and operational."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Active+XDR+Protection"
        imageAlt="Active XDR Protection"
      />
      <FeatureSection
        title="A comprehensive SIEM solution"
        description="The NexDefend Security Information and Event Management (SIEM) solution provides monitoring, detection, and alerting of security events and incidents."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=SIEM+Solution"
        imageAlt="SIEM Solution"
        reverse
      />
      <WhyOpenSource />
      <Metrics />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default HomePage;
