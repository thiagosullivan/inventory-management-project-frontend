import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // user not logged
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // user deactivated
  if (user.isActive === false)
    return <Navigate to="/account-suspended" replace />;

  return children ? <>{children}</> : <Outlet />;
}

export function ManagerRoutes({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // user is not a manager
  if (user?.role !== "MANAGER") {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
