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
        <Link to="/login" className="btn btn-secondary">Log in</Link>
        <Link to="/register" className="btn btn-primary">Free Cloud Trial</Link>
      </div>
    </header>
  );
};

export default Header;
