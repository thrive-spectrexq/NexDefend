import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">NexDefend</Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/features">Platform</Link></li>
          <li><Link to="/cloud">Cloud</Link></li>
          <li><Link to="/documentation">Documentation</Link></li>
          <li><Link to="/partners">Partners</Link></li>
          <li><Link to="/company">Company</Link></li>
        </ul>
      </nav>
      <div className="actions">
        <Link to="/dashboard" className="btn btn-secondary">Sign In</Link>
        <Link to="/dashboard" className="btn btn-primary">Register</Link>
      </div>
    </header>
  );
};

export default Header;
