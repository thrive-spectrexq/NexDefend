import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section text-center py-20">
      <h1 className="text-5xl font-bold animate-fade-in-down">AI-Driven Security Monitoring & Automated Incident Response</h1>
      <p className="text-xl mt-4 animate-fade-in-up">NexDefend ingests Suricata logs, detects threats in real-time, and automates response — powered by AI and modern observability.</p>
      <div className="mt-8 animate-fade-in">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Get Started</button>
      </div>
    </section>
  );
};

export default Hero;
