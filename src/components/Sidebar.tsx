import { Link, useLocation } from "react-router-dom";
import {
  type LucideIcon,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  ListClock,
  ListSortDescending,
  ShieldCogCorner,
  ArrowLeftRight,
  ClipboardList,
  BarChart3,
  UserRoundCog,
  Bell,
} from "lucide-react";

import { useTheme } from "./themeProvider";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
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

export default function SidebarDesktop() {
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

  const isItemActive = (href: string) => {
    if (location.pathname === href) return true;
    return location.pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden lg:flex w-[clamp(210px,20vw,280px)] shrink-0 bg-primary/20 rounded-lg h-[calc(100%-20px)] flex-col justify-between transition-all duration-200">
      <div className="p-4 xl:p-8 overflow-y-auto">
        <Link to="/dashboard" className="block mb-6 xl:mb-8">
          <img
            src={getLogo()}
            className="mb-6 xl:mb-10 w-full max-w-[180px] xl:max-w-full object-contain"
            alt="Logo"
          />
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
                    className={`mb-2 xl:mb-2.5 p-2.5 xl:p-3 border-l-4 flex items-center tracking-wide rounded-tr-lg rounded-br-lg text-sm xl:text-base transition-colors ${
                      isActive
                        ? "text-primary border-primary bg-primary/5 font-bold"
                        : "text-foreground border-primary/0 font-light hover:bg-primary/5"
                    }`}
                  >
                    <Icon
                      size={22}
                      className="mr-2.5 xl:mr-3 shrink-0 text-foreground"
                    />
                    <span className="truncate">{item.label}</span>
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
