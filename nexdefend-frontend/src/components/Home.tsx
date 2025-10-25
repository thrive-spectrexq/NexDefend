import React, { useState } from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  AlertTriangle,
  LineChart,
  Bug,
  ClipboardCheck,
  Icon as LucideIcon,
  Sparkles, // Added for AI features
  X, // For modal close button
  Loader2, // For loading spinner
  ArrowRight, // For buttons and flows
  Database, // For "How it Works"
  Server, // For "How it Works"
  BarChartBig, // For "How it Works"
} from 'lucide-react';

// --- Data for Feature Cards ---
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string; // Tailwind color class for the icon
  hasDemo?: boolean; // Optional flag for AI demos
}

const featuresData: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Real-time Threat Detection",
    description: "Ingests and analyzes Suricata logs in real-time to identify and alert on emerging threats instantly.",
    color: "text-blue-500",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Analysis",
    description: "Utilizes advanced machine learning models to detect subtle anomalies and sophisticated potential threats.",
    color: "text-purple-500",
    hasDemo: true, // Flag to show the demo button
  },
  {
    icon: LineChart,
    title: "Intuitive Dashboards",
    description: "Visualize security events and system metrics with rich, customizable dashboards powered by Grafana.",
    color: "text-orange-500",
  },
  {
    icon: Bug,
    title: "Vulnerability Scanning",
    description: "Integrated tools for proactive scanning and efficient management of system vulnerabilities to bolster your defenses.",
    color: "text-green-500",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Reporting",
    description: "Automatically generates comprehensive compliance reports based on system activity, simplifying audits.",
    color: "text-sky-500",
  },
];

// --- Reusable Feature Card Component ---
interface FeatureCardProps {
  feature: Feature;
  onDemoClick: (title: string) => void; // Pass back the title
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onDemoClick }) => {
  const Icon = feature.icon;
  return (
    <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between">
      <div className="p-6">
        <Icon className="w-12 h-12 mb-4 text-white" />
        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
        <p className="text-gray-200 leading-relaxed">{feature.description}</p>
      </div>
      {feature.hasDemo && (
        <div className="p-4 bg-black/10 border-t border-white/20">
          <button
            onClick={() => onDemoClick(feature.title)}
            className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-yellow-300 transition-colors w-full justify-center py-1 rounded-md"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            ✨ Try AI Demo
          </button>
        </div>
      )}
    </div>
  );
};

// --- Header Component ---
const Header: React.FC = () => (
  <header className="bg-white shadow-md sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="#" className="text-3xl font-bold text-blue-600">
        Nex<span className="text-purple-600">Defend</span>
      </a>
      <div className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
        <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Solutions</a>
        <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
        <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
      </div>
      <div className="flex items-center space-x-4">
        <a
          href="#"
          className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          Login
        </a>
        <a
          href="#"
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
        >
          Register
        </a>
      </div>
    </nav>
  </header>
);

// --- Hero Component ---
const Hero: React.FC = () => (
  <section className="relative text-white py-24 md:py-32 overflow-hidden">
    {/* Background decorative shapes */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-16 -translate-y-16 filter blur-xl"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full translate-x-16 translate-y-16 filter blur-xl"></div>

    <div className="container mx-auto px-6 text-center relative z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
        AI-Powered Security for a Safer Digital World
      </h1>
      <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
        NexDefend provides real-time threat detection, intelligent analysis, and automated incident response to protect your systems.
      </p>
      <a
        href="#"
        className="bg-green-500 text-white font-bold text-lg px-8 py-3 rounded-lg transition-all duration-300 hover:bg-green-600 hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  </section>
);

// --- Features Section Component ---
const Features: React.FC<{ onDemoClick: (title: string) => void }> = ({ onDemoClick }) => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Key Features of NexDefend
        </h2>
        <div className="w-24 h-1.5 bg-white/50 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresData.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            onDemoClick={feature.hasDemo ? () => onDemoClick(feature.title) : () => {}} // Pass click handler
          />
        ))}
      </div>
    </div>
  </section>
);

// --- "How It Works" Section Component ---
const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Server,
      title: "1. Ingest Data",
      description: "Real-time ingestion of Suricata logs and system data via high-performance Go pipelines."
    },
    {
      icon: BrainCircuit,
      title: "2. Analyze & Detect",
      description: "Python-based analysis and ML models process data to detect anomalies and identify threats."
    },
    {
      icon: Database,
      title: "3. Store & Automate",
      description: "Findings are stored in PostgreSQL, triggering automated incident response workflows."
    },
    {
      icon: BarChartBig,
      title: "4. Visualize & Alert",
      description: "Data is presented in intuitive Grafana dashboards, with real-time alerts for critical events."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How NexDefend Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From data ingestion to actionable alerts, our platform provides a complete, automated security cycle.
          </p>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.title}>
              <div className="flex flex-col items-center text-center p-4">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:flex justify-center items-center">
                  <ArrowRight className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Mobile/Tablet connector arrows */}
        <div className="flex md:hidden flex-col items-center space-y-4 mt-4">
          <ArrowRight className="w-8 h-8 text-gray-300 -rotate-90" />
          <ArrowRight className="w-8 h-8 text-gray-300 -rotate-90" />
          <ArrowRight className="w-8 h-8 text-gray-300 -rotate-90" />
        </div>
      </div>
    </section>
  );
};

// --- CTA Section Component ---
const CTASection: React.FC = () => (
  <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-24 overflow-hidden">
    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-16 -translate-y-16 filter blur-xl"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full translate-x-16 translate-y-16 filter blur-xl"></div>

    <div className="container mx-auto px-6 text-center relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Ready to Secure Your Systems?
      </h2>
      <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10">
        Join the leading platform in AI-driven security and turn your data into actionable defense.
      </p>
      <a
        href="#"
        className="bg-green-500 text-white font-bold text-lg px-8 py-3 rounded-lg transition-all duration-300 hover:bg-green-600 hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
      >
        Get Started Now
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  </section>
);


// --- Footer Component ---
const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-gray-400 py-12">
    <div className="container mx-auto px-6 text-center">
      <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
    </div>
  </footer>
);

// --- Gemini API Utility ---

// Define system prompts
const systemPrompts = {
  "Automated Incident Response": `You are 'NexDefend AI', a world-class security analyst. Your task is to write a concise, professional incident report summary based on a brief description of a security event.
The summary should be in clear, actionable plain text. Do NOT use markdown.
Structure your response as follows:

**Event Summary**:
[A brief overview of what happened.]

**Potential Impact**:
[A short assessment of the potential risk (e.g., Data exfiltration, service disruption, unauthorized access).]

**Recommended Actions**:
- [Immediate action 1]
- [Immediate action 2]
- [Immediate action 3]`,

  "AI-Powered Analysis": `You are 'NexDefend AI', an expert security operations center (SOC) analyst. A user will provide a log snippet or event description. Your task is to analyze it and provide a brief, clear assessment.
Do NOT use markdown.
Structure your response as follows:

**Log Analysis**:
[A brief, 1-2 sentence explanation of what the log/event means.]

**Threat Level**:
[One of: Info, Low, Medium, High, Critical]

**Recommended Action**:
[A single, concise next step for a junior analyst to take (e.g., "Monitor IP for further activity," "Isolate host from network," "Escalate to Tier 2 for forensic analysis.").]`
};

/**
 * Fetches data from the Gemini API with exponential backoff.
 * @param {string} userQuery The user's input.
 * @param {string} featureTitle The title of the feature to determine the system prompt.
 * @param {number} maxRetries Maximum number of retries.
 * @returns {Promise<string>} The generated text from the API.
 */
const fetchWithBackoff = async (
  userQuery: string,
  featureTitle: string,
  maxRetries: number = 3
): Promise<string> => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const apiUrl = `https://generativanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const systemPrompt =
    systemPrompts[featureTitle as keyof typeof systemPrompts] ||
    systemPrompts["Automated Incident Response"]; // Default fallback

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
  };

  let delay = 1000; // Start with 1 second
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text;
      } else {
        throw new Error("Invalid API response structure.");
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error("Gemini API call failed after max retries:", error);
        return "Error: Unable to generate report. Please try again later.";
      }
      // Wait for the delay and then double it for the next retry
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
  return "Error: Unable to connect to AI service.";
};


// --- AI Report Generator Modal ---
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  reportResult: string;
  setModalInput: (value: string) => void;
  modalInput: string;
  featureTitle: string; // To customize the modal
}

const GenerateReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  reportResult,
  setModalInput,
  modalInput,
  featureTitle
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInput.trim() || isLoading) return;
    onGenerate(modalInput);
  };

  // Customize modal content based on the feature
  const modalConfig = {
    label: featureTitle === "AI-Powered Analysis"
      ? 'Paste a log snippet or describe an event to analyze'
      : 'Describe a security event for an incident report',
    placeholder: featureTitle === "AI-Powered Analysis"
      ? 'e.g., "sshd[1234]: Failed password for invalid user admin from 10.0.0.1 port 22"'
      : 'e.g., "Multiple failed logins from 192.168.0.1 followed by a successful one."'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-800 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {featureTitle} Demo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-2">
              {modalConfig.label}
            </label>
            <textarea
              id="eventDescription"
              rows={4}
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={modalConfig.placeholder}
            />
            <button
              type="submit"
              disabled={isLoading || !modalInput.trim()}
              className="mt-4 w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "✨ Generate Report Summary"
              )}
            </button>
          </form>

          {/* Result Area */}
          {reportResult && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-2">Generated Report:</h4>
              <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {reportResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---
const Home: React.FC = () => {
  // State for the AI report modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [reportResult, setReportResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState(""); // To track which demo is open

  const handleOpenModal = (title: string) => {
    setIsModalOpen(true);
    setModalTitle(title);
    setModalInput(""); // Clear previous input
    setReportResult(""); // Clear previous result
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles the report generation logic.
   */
  const handleGenerateReport = async (userInput: string) => {
    setIsLoading(true);
    setReportResult(""); // Clear previous result

    const result = await fetchWithBackoff(userInput, modalTitle);

    setReportResult(result);
    setIsLoading(false);
  };

  return (
    <div className="font-sans bg-white antialiased">
      <Header />
      <main className="relative bg-gradient-to-br from-blue-600 to-purple-700">
        <Hero />
        <Features onDemoClick={handleOpenModal} />
      </main>
      <HowItWorks />
      <CTASection />
      <Footer />

      {/* Render the modal */}
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGenerate={handleGenerateReport}
        isLoading={isLoading}
        reportResult={reportResult}
        modalInput={modalInput}
        setModalInput={setModalInput}
        featureTitle={modalTitle}
      />
    </div>
  );
};

export default Home;
