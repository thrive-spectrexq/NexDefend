import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">NexDefend</h1>
        <nav>
          <Link to="/login" className="text-lg hover:text-gray-400 mr-4">Login</Link>
          <Link to="/register" className="text-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Register</Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">Welcome to NexDefend</h2>
        <p className="text-xl mb-8">Your real-time security monitoring and threat detection solution.</p>
        <Link to="/register" className="text-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full">Get Started</Link>
      </main>

      <footer className="text-center py-6">
        <p>&copy; 2024 NexDefend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
