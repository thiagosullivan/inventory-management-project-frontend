import { Link, useLocation } from "react-router-dom";
import {
  type LucideIcon,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Activity,
  Megaphone,
  ListClock,
  ListSortDescending,
  PartyPopper,
  UserShield,
} from "lucide-react";

import { ModeToggle } from "./modeToggle";
import { useTheme } from "./themeProvider";
import logoLight from "../../public/logo-light.png";
import logoDark from "../../public/logo-dark.png";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItemsProps {
  label: string;
  icon: LucideIcon;
  href: string;
  onlyManager?: boolean;
}

const MenuList: MenuItemsProps[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: "/products",
  },
  {
    label: "Stock",
    icon: Layers,
    href: "/stock",
  },
  {
    label: "History",
    icon: ListClock,
    href: "/history",
  },
  {
    label: "Categories",
    icon: ListSortDescending,
    href: "/categories",
  },
  {
    label: "Activity",
    icon: Activity,
    href: "/activity",
  },
  {
    label: "Alerts",
    icon: Megaphone,
    href: "/alerts",
  },
  {
    label: "Products Resolve",
    icon: PartyPopper,
    href: "/products-resolve",
  },
  {
    label: "Admin",
    icon: UserShield,
    href: "/admin",
    onlyManager: true,
  },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const location = useLocation();
  const user = useAuth();

  const isManager = user.user?.role === "MANAGER";

  const visibleMenuItems = MenuList.filter((item) => {
    if (item.onlyManager && !isManager) {
      return false; // Esconde o item
    }
    return true; // Mantém o item
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

  return (
    <aside className="max-w-[280px] w-full bg-primary/20 rounded-lg h-full flex flex-col justify-between">
      <div className="p-8">
        <Link to="/dashboard" className="mb-8">
          <img src={getLogo()} className="mb-10" />
        </Link>
        <nav>
          <ul>
            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;

              const isActive = location.pathname === item.href;

              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={`mb-2.5 p-3 border-l-4 flex items-center font-light ${isActive ? "text-primary border-primary" : "text-foreground border-primary/0"}`}
                  >
                    <Icon size={24} className="mr-3" /> {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <footer className="mt-auto border-t border-primary">
        <ModeToggle />
      </footer>
    </aside>
  );
}

// Dashboard
// Stock
// History
// Categories
// Activity
// Alerts
// Products Resolve
// Admin
