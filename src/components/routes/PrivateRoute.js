import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // Check if user is logged in and has admin role
  return currentUser?.role === 'admin' ? children : <Navigate to="/admin/login" />;
} 