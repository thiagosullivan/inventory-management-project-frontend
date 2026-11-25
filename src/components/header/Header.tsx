// src/components/header/Header.tsx
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { greeting } from "@/utils/greeting";
import { buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";
import NavUser from "./NavUser";
import { ModeToggle } from "../modeToggle";
import { useUnreadCount } from "@/hooks/useNotifications";

export default function Header() {
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();

  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <>
      <header className="flex justify-between items-center px-5">
        <div className="text-foreground">
          <p className="font-black text-xl">Olá, {firstName} 👋🏻</p>
          <span className="text-muted-foreground text-sm">{greeting}!</span>
        </div>
        <div className="flex items-center gap-x-5">
          <Link
            to="/alertas"
            className={`relative ${buttonVariants({ size: "icon" })} w-12 h-12 bg-muted-foreground/30 text-foreground cursor-pointer`}
            aria-label="Notificações"
          >
            <Bell />
            {unreadCount > 0 && (
              <Badge
                // variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center bg-gray-400 text-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Link>
          <NavUser />
          <ModeToggle />
        </div>
      </header>

      <div className="mb-12" />
    </>
  );
}
