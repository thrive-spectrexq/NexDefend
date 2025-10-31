import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default PrivateRoute;
