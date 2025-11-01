import './ComplianceSection.css';

const ComplianceSection = () => {
  return (
    <section className="compliance-section py-20 bg-gray-800">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Compliance & Reporting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Policy Coverage</h3>
            <p>Ensure your systems are compliant with industry standards. NexDefend helps you meet GDPR, ISO 27001, and SOC2 requirements.</p>
          </div>
          <div className="bg-gray-900 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">System Audit Summary</h3>
            <p>Generate detailed reports to track your security posture and identify areas for improvement.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
