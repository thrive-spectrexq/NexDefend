import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section bg-gray-900 text-white py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-4">Product</h3>
          <ul>
            <li>Overview</li>
            <li>Features</li>
            <li>Architecture</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Docs</h3>
          <ul>
            <li>Setup</li>
            <li>API</li>
            <li>Contributing</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Community</h3>
          <ul>
            <li>GitHub</li>
            <li>Discord</li>
            <li>Twitter</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">License</h3>
          <p>GPL-3.0</p>
        </div>
      </div>
      <div className="text-center mt-8 border-t border-gray-800 pt-8">
        <p>© 2025 NexDefend.</p>
      </div>
    </footer>
  );
};

export default Footer;
