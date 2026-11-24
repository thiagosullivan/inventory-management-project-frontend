import LoginForm from "@/components/forms/login-form";
import { useTheme } from "@/components/themeProvider";
import HomeBackground from "@/assets/home-bg.jpg";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

export default function HomePage() {
  const { theme } = useTheme();

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
    <div className="flex items-center lexend-font h-screen">
      <div className="p-8 h-full">
        <img
          src={HomeBackground}
          className="max-w-[815px] h-full object-cover rounded-4xl"
        />
      </div>
      <div className="max-w-[445px] w-full">
        <div className="mb-8">
          <img src={getLogo()} className="mb-10" />
          <h2 className="font-bold text-3xl mb-1">Bem-vindo 👋</h2>
          <p className="font-light text-muted-foreground">
            Por favor faça o login aqui
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
