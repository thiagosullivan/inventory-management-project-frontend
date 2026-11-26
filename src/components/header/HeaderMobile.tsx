import shortLogo from "@/assets/short-logo.png";
import { SidebarTrigger } from "../ui/sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { greeting } from "@/utils/greeting";

export function HeaderMobile() {
  const { user } = useAuth();

  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <header className="md:hidden bg-primary/20 py-2 px-3 flex items-center justify-between">
      <SidebarTrigger className="-ml-1 lg:hidden hover:bg-blue-solid!" />
      <Link to="/" className="flex items-center gap-x-2">
        <img src={shortLogo} className="w-8 h-8" alt="Logo" />
        <p className="font-bold">Stockify</p>
      </Link>
      <div className="text-foreground flex items-center flex-col">
        <p className="font-black text-sm">Olá, {firstName} 👋🏻</p>
        <span className="text-muted-foreground text-xs">{greeting}!</span>
      </div>
    </header>
  );
}
