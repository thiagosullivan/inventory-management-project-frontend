import React from "react";
import { Search, Bell } from "lucide-react";
import NavUser from "./NavUser";
import { useAuth } from "@/contexts/AuthContext";
import { greeting } from "@/utils/greeting";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Header() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <header className="flex justify-between items-center">
      <div className="text-foreground">
        <p className="font-black text-xl">Hello, {firstName} 👋🏻</p>
        <span className="text-muted-foreground text-sm">{greeting}</span>
      </div>
      <div className="flex items-center gap-x-5">
        <div className="relative">
          <Input
            className="max-w-[260px] w-full h-12.5 rounded-lg pl-11 text-muted-foreground"
            type="text"
            placeholder="Search"
          />
          <Search
            className="absolute top-1/2 -translate-y-1/2 left-4 text-muted-foreground"
            size={24}
          />
        </div>
        <Button className="w-12 h-12 bg-muted-foreground/30 text-foreground">
          <Bell />
        </Button>
        <NavUser />
      </div>
    </header>
  );
}
