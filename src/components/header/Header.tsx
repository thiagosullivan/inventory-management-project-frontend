// src/components/header/Header.tsx

import { useAuth } from "@/contexts/AuthContext";
import { greeting } from "@/utils/greeting";
import NavUser from "./NavUser";
import { ModeToggle } from "../modeToggle";
import { NotificationButton } from "./NotificationButton";

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <>
      <header className="hidden lg:flex justify-between items-center px-5">
        <div className="text-foreground">
          <p className="font-black text-xl">Olá, {firstName} 👋🏻</p>
          <span className="text-muted-foreground text-sm">{greeting}!</span>
        </div>
        <div className="flex items-center gap-x-5">
          <NotificationButton />
          <NavUser />
          <ModeToggle />
        </div>
      </header>

      <div className="mb-12 hidden lg:block" />
    </>
  );
}
