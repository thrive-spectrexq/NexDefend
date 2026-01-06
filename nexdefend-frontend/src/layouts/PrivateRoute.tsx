import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children ? <>{children}</> : <Outlet />
}

export default PrivateRoute
