import { useState } from 'react';
import './SetupInstructions.css';

const SetupInstructions = () => {
  const [activeTab, setActiveTab] = useState('docker');

  return (
    <section className="setup-instructions-section py-20 bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Setup & Deployment</h2>
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-lg ${activeTab === 'docker' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('docker')}
          >
            Docker
          </button>
          <button
            className={`px-6 py-2 rounded-lg ml-4 ${activeTab === 'scripted' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('scripted')}
          >
            Scripted
          </button>
          <button
            className={`px-6 py-2 rounded-lg ml-4 ${activeTab === 'manual' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual
          </button>
        </div>
        <div>
          {activeTab === 'docker' && (
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Recommended Setup: Docker</h3>
              <p>This is the easiest and recommended way to get NexDefend running. It uses Docker Compose to start all the required services.</p>
              <pre className="bg-gray-800 p-4 rounded-lg mt-4">
                <code>
                  git clone https://github.com/thrive-spectrexq/NexDefend.git<br />
                  cd NexDefend<br />
                  docker-compose up -d
                </code>
              </pre>
            </div>
          )}
          {activeTab === 'scripted' && (
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Scripted Setup</h3>
              <p>These scripts automate the setup process.</p>
              <h4 className="text-xl font-bold mt-4">On Linux/macOS</h4>
              <pre className="bg-gray-800 p-4 rounded-lg mt-2">
                <code>
                  chmod +x nexdefend_setup.sh<br />
                  ./nexdefend_setup.sh
                </code>
              </pre>
              <h4 className="text-xl font-bold mt-4">On Windows (via PowerShell)</h4>
              <pre className="bg-gray-800 p-4 rounded-lg mt-2">
                <code>
                  .\\nexdefend_setup.ps1 start
                </code>
              </pre>
            </div>
          )}
          {activeTab === 'manual' && (
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Manual Setup</h3>
              <p>If you prefer to run each component manually:</p>
              <h4 className="text-xl font-bold mt-4">Backend (Go)</h4>
              <pre className="bg-gray-800 p-4 rounded-lg mt-2">
                <code>
                  go mod tidy<br />
                  go run main.go
                </code>
              </pre>
              <h4 className="text-xl font-bold mt-4">AI Service (Python)</h4>
              <pre className="bg-gray-800 p-4 rounded-lg mt-2">
                <code>
                  cd nexdefend-ai && \\<br />
                  python3 -m venv venv && \\<br />
                  . venv/bin/activate && \\<br />
                  pip install --upgrade pip && \\<br />
                  pip install -r requirements.txt
                </code>
              </pre>
              <h4 className="text-xl font-bold mt-4">Frontend (React)</h4>
              <pre className="bg-gray-800 p-4 rounded-lg mt-2">
                <code>
                  cd nexdefend-frontend<br />
                  npm install<br />
                  npm start
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SetupInstructions;
