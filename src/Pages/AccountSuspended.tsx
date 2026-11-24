import { useTheme } from "@/components/themeProvider";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

function AccountSuspended() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const getLogo = () => {
    if (theme === "dark") return logoDark;
    if (theme === "light") return logoLight;

    if (theme === "system") {
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return isSystemDark ? logoDark : logoLight;
    }

    return logoLight;
  };

  async function handleBack() {
    try {
      await signOut(); // 🔹 backend: revoga sessão + limpa cookie
    } catch {
      // mesmo se falhar, limpa local
    } finally {
      setUser(null); // 🔹 limpa o stub { isActive: false }
      navigate("/"); // 🔹 agora PublicRoute deixa passar
    }
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="max-w-[445px] w-full">
        <div className="mb-8">
          <img src={getLogo()} className="mb-15 mx-auto" />
          <div className="text-center mb-15">
            <h2 className="font-bold text-3xl mb-4">
              Sua conta está <span className="underline">suspensa</span>!
            </h2>
            <p className="font-light text-muted-foreground">
              Entre em contato com o administrador
            </p>
          </div>
          <Button
            className="py-6 px-10 text-base mx-auto flex cursor-pointer"
            onClick={handleBack}
          >
            Voltar
          </Button>
        </div>
      </div>
    </main>
  );
}

export default AccountSuspended;
