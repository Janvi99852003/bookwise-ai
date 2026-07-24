import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { provider, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="text-cream/50 font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!provider) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;