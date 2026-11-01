import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PublicRouteProps {
  children?: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // 🔹 user desativado logado → deixa a página de suspensão cuidar
  if (user && user.isActive === false) {
    return <Navigate to="/account-suspended" replace />;
  }

  if (user) {
    // 🔹 redireciona conforme acesso (evita double-redirect)
    const isWarehouse = user.sector?.isWarehouse === true;
    const isManager = user.role === "MANAGER";
    return (
      <Navigate
        to={isManager || isWarehouse ? "/dashboard" : "/requests"}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
