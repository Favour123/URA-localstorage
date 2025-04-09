import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}

export default PrivateRoute;
