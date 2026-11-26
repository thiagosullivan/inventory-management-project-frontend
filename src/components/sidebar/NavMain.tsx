"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface NavItem {
  label: string;
  icon?: LucideIcon;
  href: string;
  warehouseOnly?: boolean;
  isActive?: boolean;
  onlyManager?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { user } = useAuth();

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canSeeWarehouse = isManager || isWarehouseUser;

  const visibleMenuItems = items.filter((item) => {
    if (item.onlyManager && !isManager) return false;
    if (item.warehouseOnly && !canSeeWarehouse) return false;
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        {visibleMenuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              tooltip={item.label}
              isActive={item.isActive}
              render={
                <Link
                  to={item.href}
                  className="bg-transparent! hover:bg-primary/20! text-base! mb-2"
                />
              }
            >
              {item.icon && <item.icon className="size-5!" />}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
