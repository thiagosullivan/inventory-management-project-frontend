// src/components/header/Header.tsx
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { greeting } from "@/utils/greeting";
import { Button } from "../ui/button";
import NavUser from "./NavUser";
import { ModeToggle } from "../modeToggle";
import { EmailVerificationBanner } from "../auth/EmailVerificationBanner";

export default function Header() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <>
      <header className="flex justify-between items-center">
        <div className="text-foreground">
          <p className="font-black text-xl">Hello, {firstName} 👋🏻</p>
          <span className="text-muted-foreground text-sm">{greeting}</span>
        </div>
        <div className="flex items-center gap-x-5">
          <Button className="w-12 h-12 bg-muted-foreground/30 text-foreground cursor-pointer">
            <Bell />
          </Button>
          <NavUser />
          <ModeToggle />
        </div>
      </header>

      {/* 🔹 Fase 7.9 — banner de verificação (só aparece se !emailVerified) */}
      {/* <EmailVerificationBanner /> */}

      {/* espaço abaixo do header, mantendo o mb-12 original quando não há banner */}
      <div className="mb-12" />
    </>
  );
}
