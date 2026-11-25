"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export interface NavItem {
  label: string;
  icon?: LucideIcon;
  href: string;
  warehouseOnly?: boolean;
  isActive?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              tooltip={item.label}
              isActive={item.isActive}
              render={
                <Link
                  to={item.href}
                  className="bg-transparent! hover:bg-primary/20!"
                />
              }
            >
              {item.icon && <item.icon />}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
