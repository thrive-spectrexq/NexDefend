import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import ArchitectureFlow from '../components/landing/ArchitectureFlow';
import FeatureSection from '../components/landing/FeatureSection';
import Integrations from '../components/landing/Integrations';
import SetupInstructions from '../components/landing/SetupInstructions';
import DashboardPreview from '../components/landing/DashboardPreview';
import ComplianceSection from '../components/landing/ComplianceSection';
import OpenSourceCTA from '../components/landing/OpenSourceCTA';
import Footer from '../components/landing/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Hero />
      <FeaturesGrid />
      <ArchitectureFlow />
      <FeatureSection
        title="Real-Time Threat Detection"
        description="Detect, analyze, and act — within milliseconds."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Threat+Detection"
        imageAlt="Threat Detection"
      />
      <FeatureSection
        title="AI-Powered Analysis"
        description="Split view: Log data → Threat score → Response action."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=AI+Analysis"
        imageAlt="AI Analysis"
        reverse
      />
      <FeatureSection
        title="Incident Response & Automation"
        description="“When NexDefend detects, it reacts.” Timeline UI showing automated alerts, email notifications, and report generation."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Automation"
        imageAlt="Automation"
      />
      <FeatureSection
        title="Dashboards & Visualization"
        description="Grafana UI preview in a glassy frame. Charts (Threat levels, Geo IP attacks, Response rate)."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Dashboards"
        imageAlt="Dashboards"
        reverse
      />
      <FeatureSection
        title="Vulnerability Scanning"
        description="Show example scan summary (host, CVE, status, remediation)."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Scanning"
        imageAlt="Scanning"
      />
      <FeatureSection
        title="Compliance & Reporting"
        description="Minimalist charts showing “Policy Coverage”, “System Audit Summary”."
        image="https://via.placeholder.com/500x300.png/1a1a1a/ffffff?text=Reporting"
        imageAlt="Reporting"
        reverse
      />
      <Integrations />
      <SetupInstructions />
      <DashboardPreview />
      <ComplianceSection />
      <OpenSourceCTA />
      <Footer />
    </div>
  );
};

export default HomePage;
