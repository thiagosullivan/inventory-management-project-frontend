import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../services/auth";

export function useLogout() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return async function logout() {
    try {
      await signOut();
      setUser(null);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer logout";
      toast.error(message);
    }
  };
}
