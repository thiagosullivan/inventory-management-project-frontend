import LoginForm from "@/components/forms/login-form";
import { useTheme } from "@/components/themeProvider";
import HomeBackground from "@/assets/home-bg.webp";
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
    <div className="flex items-center lexend-font h-screen justify-center lg:justify-start">
      <div className="hidden lg:flex min-w-0 p-6 xl:p-8 h-full items-center justify-center">
        <img
          src={HomeBackground}
          className="w-full max-w-[815px] h-full object-cover rounded-4xl"
        />
      </div>
      <div className="max-w-[445px] w-full lg:pr-8">
        <div className="mb-8">
          <img src={getLogo()} className="mb-10 mx-auto lg:mx-0" />
          <h2 className="font-bold text-3xl mb-1 text-center lg:text-left">
            Bem-vindo 👋
          </h2>
          <p className="font-light text-muted-foreground text-center lg:text-left">
            Por favor faça o login aqui
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
