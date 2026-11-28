import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children?: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground px-4 py-6 flex items-center gap-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        Carregando...
      </div>
    );
  }

  // 🔹 user desativado logado → deixa a página de suspensão cuidar
  if (user && user.isActive === false) {
    return <Navigate to="/conta-suspensa" replace />;
  }

  if (user) {
    // 🔹 redireciona conforme acesso (evita double-redirect)
    const isWarehouse = user.sector?.isWarehouse === true;
    const isManager = user.role === "MANAGER";
    return (
      <Navigate
        to={isManager || isWarehouse ? "/dashboard" : "/pedidos"}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
