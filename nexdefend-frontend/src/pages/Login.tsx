import useAuthStore from '../stores/authStore';

const Login = () => {
  const { login } = useAuthStore();

  const handleLogin = () => {
    // In a real application, you would perform a proper login flow.
    // For now, we'll just simulate a successful login.
    login('fake-token');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">NexDefend</h1>
        <p className="mb-6">Please log in to continue.</p>
        <button
          onClick={handleLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
