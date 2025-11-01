import './OpenSourceCTA.css';

const OpenSourceCTA = () => {
  return (
    <section className="open-source-cta-section text-center py-20 bg-gray-800">
      <h2 className="text-4xl font-bold">Join the NexDefend community</h2>
      <p className="text-xl mt-4">Contribute, build plugins, and secure the open internet together.</p>
      <div className="mt-8">
        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mr-4">GitHub Repository</button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mr-4">Documentation</button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">Report an Issue</button>
      </div>
    </section>
  );
};

export default OpenSourceCTA;
