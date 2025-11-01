import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <div className="footer-column">
          <h4>Explore</h4>
          <ul>
            <li><a href="#">Overview</a></li>
            <li><a href="#">XDR</a></li>
            <li><a href="#">SIEM</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Services</h4>
          <ul>
            <li><a href="#">NexDefend Cloud</a></li>
            <li><a href="#">Professional support</a></li>
            <li><a href="#">Consulting services</a></li>
            <li><a href="#">Training courses</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Documentation</h4>
          <ul>
            <li><a href="#">Quickstart</a></li>
            <li><a href="#">Getting started</a></li>
            <li><a href="#">Installation guide</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">Legal</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 NexDefend, Inc.</p>
        <div className="social-links">
          {/* Add social media icons */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
