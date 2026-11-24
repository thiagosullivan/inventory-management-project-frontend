import { Link, useLocation } from "react-router-dom";
import {
  type LucideIcon,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  // Activity,
  // Megaphone,
  ListClock,
  ListSortDescending,
  // PartyPopper,
  ShieldCogCorner,
  ArrowLeftRight,
  ClipboardList,
  BarChart3,
  UserRoundCog,
  Bell,
} from "lucide-react";

import { useTheme } from "./themeProvider";
import logoLight from "../../public/logo-light.png";
import logoDark from "../../public/logo-dark.png";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItemsProps {
  label: string;
  icon: LucideIcon;
  href: string;
  onlyManager?: boolean;
  warehouseOnly?: boolean;
}

const MenuList: MenuItemsProps[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    warehouseOnly: true,
  },
  {
    label: "Produtos",
    icon: ShoppingCart,
    href: "/produtos",
    warehouseOnly: true,
  },
  {
    label: "Estoque",
    icon: Layers,
    href: "/estoque",
    warehouseOnly: true,
  },
  {
    label: "Pedidos",
    icon: ClipboardList,
    href: "/pedidos",
  },
  {
    label: "Movimentações",
    icon: ArrowLeftRight,
    href: "/movimentacoes",
  },
  {
    label: "Histórico",
    icon: ListClock,
    href: "/historico",
    warehouseOnly: true,
  },
  {
    label: "Categorias",
    icon: ListSortDescending,
    href: "/categorias",
    warehouseOnly: true,
  },
  // 🔴 legado — sem tela (Fase 8)
  // {
  //   label: "Activity",
  //   icon: Activity,
  //   href: "/activity",
  //   warehouseOnly: true,
  // },
  // 🔴 legado — sem tela (Fase 8)
  // {
  //   label: "Products Resolve",
  //   icon: PartyPopper,
  //   href: "/products-resolve",
  //   warehouseOnly: true,
  // },
  // 🔹 novo (Fase 7)
  {
    label: "Relatórios",
    icon: BarChart3,
    href: "/relatorios",
    warehouseOnly: true,
  },
  {
    label: "Alertas",
    icon: Bell,
    href: "/alertas",
  },
  {
    label: "Minha Conta",
    icon: UserRoundCog,
    href: "/minha-conta",
  },
  {
    label: "Admin",
    icon: ShieldCogCorner,
    href: "/admin",
    onlyManager: true,
  },
];

// 🔴 imports legados mantidos para quando as telas voltarem (Fase 8).
//    O `tsc` não reclama de import não usado por causa do `noUnusedLocals`?
//    Se reclamar, comente também as 3 linhas de import abaixo.

// const _legacyIcons = { Activity, Megaphone, PartyPopper };

export default function Sidebar() {
  const { theme } = useTheme();
  const location = useLocation();
  const { user } = useAuth();

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canSeeWarehouse = isManager || isWarehouseUser;

  const visibleMenuItems = MenuList.filter((item) => {
    if (item.onlyManager && !isManager) return false;
    if (item.warehouseOnly && !canSeeWarehouse) return false;
    return true;
  });

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

  // 🔹 Ativo se pathname === href OU começa com href + "/" (ex.: /reports/requests)
  const isItemActive = (href: string) => {
    if (location.pathname === href) return true;
    return location.pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="max-w-[280px] w-full bg-primary/20 rounded-lg h-full flex flex-col justify-between">
      <div className="p-8">
        <Link to="/dashboard" className="mb-8">
          <img src={getLogo()} className="mb-10 w-full" alt="Logo" />
        </Link>
        <nav>
          <ul>
            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={`mb-2.5 p-3 border-l-4 flex items-center tracking-wide rounded-tr-lg rounded-br-lg ${
                      isActive
                        ? "text-primary border-primary bg-primary/5 font-bold"
                        : "text-foreground border-primary/0 font-light"
                    }`}
                  >
                    <Icon size={24} className="mr-3 text-foreground" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
