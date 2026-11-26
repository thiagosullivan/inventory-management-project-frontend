import * as React from "react";

import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  ClipboardList,
  ArrowLeftRight,
  ListClock,
  ListSortDescending,
  BarChart3,
  Bell,
  UserRoundCog,
  ShieldCogCorner,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { HeaderNavMobile } from "./HeaderNavMobile";
import { NavUserMobile } from "./NavUserMobile";
import { ModeToggle } from "../modeToggle";
import { NotificationButton } from "../header/NotificationButton";
import { Separator } from "../ui/separator";

const data = {
  navLinks: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Produtos",
      icon: ShoppingCart,
      href: "/produtos",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Estoque",
      icon: Layers,
      href: "/estoque",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Pedidos",
      icon: ClipboardList,
      href: "/pedidos",
      isActive: true,
    },
    {
      label: "Movimentações",
      icon: ArrowLeftRight,
      href: "/movimentacoes",
      isActive: true,
    },
    {
      label: "Histórico",
      icon: ListClock,
      href: "/historico",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Categorias",
      icon: ListSortDescending,
      href: "/categorias",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Alertas",
      icon: Bell,
      href: "/alertas",
      isActive: true,
    },
    {
      label: "Minha Conta",
      icon: UserRoundCog,
      href: "/minha-conta",
      isActive: true,
    },
    {
      label: "Admin",
      icon: ShieldCogCorner,
      href: "/admin",
      onlyManager: true,
      isActive: true,
    },
  ],
};

export function SidebarMobile({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <div className="lg:hidden">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <HeaderNavMobile />
        </SidebarHeader>
        <Separator className="bg-primary/20" />
        <SidebarContent>
          <NavMain items={data.navLinks} />
        </SidebarContent>
        <SidebarFooter>
          <div className="ml-auto">
            <NotificationButton />
            <ModeToggle />
          </div>
          <Separator className="bg-primary/20" />
          <NavUserMobile />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
