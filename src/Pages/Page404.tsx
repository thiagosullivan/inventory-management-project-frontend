import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/themeProvider";

import img404Light from "../../public/not-found-light.png";
import img404Dark from "../../public/not-found-dark.png";
import logoLight from "../../public/logo-light.png";
import logoDark from "../../public/logo-dark.png";

export default function Page404(): ReactElement {
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

  const getImg = () => {
    if (theme === "dark") return img404Dark;
    if (theme === "light") return img404Light;

    if (theme === "system") {
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return isSystemDark ? img404Dark : img404Light;
    }

    return logoLight;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center w-full mt-10 mb-20">
        <Link to="/" className="">
          <img src={getLogo()} className="max-w-[280px] w-full" />
        </Link>
      </div>
      <div className="text-center flex-1 max-w-[460px] w-full  mx-auto">
        <img src={getImg()} className="max-w-[400px] w-full mx-auto" />
        <div className="mt-8">
          <h1 className="text-primary font-bold text-2xl mb-5">Erro 404 😢</h1>
          <p>Ops! A página que você está procurando não existe.</p>
          <Link
            to="/"
            style={{ color: "#646cff", textDecoration: "underline" }}
          >
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
