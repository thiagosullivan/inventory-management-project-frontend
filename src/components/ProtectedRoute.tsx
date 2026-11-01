import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

// ============================================================
// Qualquer usuário logado e ativo
// ============================================================

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // não logado → volta pra home, guardando a origem
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // usuário desativado
  if (user.isActive === false) {
    return <Navigate to="/account-suspended" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// ============================================================
// Somente MANAGER
// ============================================================

export function ManagerRoutes({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // defensivo: sem user, volta pra raiz
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "MANAGER") {
    // STAFF não pode /admin → manda pro destino padrão dele
    const fallback =
      user.sector?.isWarehouse === true ? "/dashboard" : "/requests";
    return <Navigate to={fallback} replace state={{ accessDenied: true }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// ============================================================
// Almoxarifado (STAFF isWarehouse) ou MANAGER
// ============================================================

/**
 * Restringe a rota ao Almoxarifado (STAFF do setor isWarehouse) ou MANAGER.
 * Outros setores são redirecionados pro /requests com sinal de acesso negado.
 *
 * Deve ser aninhado DENTRO do ProtectedRoute (que já garante auth).
 */
export function WarehouseOnlyRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  // defensivo
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔹 `sector` pode faltar em estado legado/cache — não quebra
  const isWarehouse = user.sector?.isWarehouse === true;
  const canAccess = user.role === "MANAGER" || isWarehouse;

  if (!canAccess) {
    return <Navigate to="/requests" replace state={{ accessDenied: true }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
