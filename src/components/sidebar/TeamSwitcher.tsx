"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../themeProvider";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import shortLogo from "@/assets/short-logo.png";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getLogo = () => {
    if (theme === "dark") return shortLogo;
    if (theme === "light") return shortLogo;
    if (theme === "system") {
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return isSystemDark ? shortLogo : shortLogo;
    }
    return shortLogo;
  };

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer hover:bg-transparent!"
                onClick={() => navigate("/")}
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <img src={getLogo()} className="w-8 h-8" alt="Logo" />
            </div>
            <p className="text-lg ml-2 font-bold">Stockify</p>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
