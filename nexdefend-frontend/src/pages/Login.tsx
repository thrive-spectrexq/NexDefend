import useAuthStore from '../stores/authStore';
import './Login.css';

const Login = () => {
  const { login } = useAuthStore();

  const handleLogin = () => {
    // In a real application, you would perform a proper login flow.
    // For now, we'll just simulate a successful login.
    login('fake-token');
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h1>NexDefend</h1>
        <p>Please log in to continue.</p>
        <button onClick={handleLogin} className="btn btn-primary">
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
