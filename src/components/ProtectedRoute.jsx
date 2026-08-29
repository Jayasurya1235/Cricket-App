import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Guards protected pages. If the user is not authenticated they are redirected
// to the login page, carrying along the page they tried to visit so we can send
// them back after a successful login.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
