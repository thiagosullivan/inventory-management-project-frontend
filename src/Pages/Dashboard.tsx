import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function DashboardPage() {
  const location = useLocation();

  useEffect(() => {
    // Verifica se o usuário caiu aqui vindo de um redirecionamento forçado
    if (location.state?.accessDenied) {
      toast.error("Acesso Negado", {
        description: "Você não tem permissão para acessar aquela métrica.",
      });
    }
  }, [location]);

  return (
    <div className="flex items-start">
      <h1>Dashboard</h1>
    </div>
  );
}
