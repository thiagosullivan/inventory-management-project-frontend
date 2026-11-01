import { useTheme } from "@/components/themeProvider";
import logoLight from "../../public/logo-light.png";
import logoDark from "../../public/logo-dark.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function AccountSuspended() {
  const { theme } = useTheme();
  const navigate = useNavigate();

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
            onClick={() => navigate("/")}
          >
            Voltar
          </Button>
        </div>
      </div>
    </main>
  );
}

export default AccountSuspended;
