"use client";

import { useNavigate } from "react-router-dom";

import {
  BadgeAlert,
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOutIcon,
  Settings,
} from "lucide-react";

import { useLogout } from "@/hooks/useLogout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/getInitials";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function NavUserMobile() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-primary/20 data-[popup-open]:text-sidebar-accent-foreground cursor-pointer hover:bg-primary/20"
              />
            }
          >
            <Avatar className="h-10 w-10 rounded-md mr-2">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                {getInitials(user.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg bg-[#cce2f3]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-10 w-10 rounded-md mr-2">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                      {getInitials(user.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <div className="text-sm flex items-center gap-x-1 py-1 min-w-0">
                      <span className="truncate text-xs">{user.email}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          {user.emailVerified === true ? (
                            <BadgeCheck size={16} className="text-green-500" />
                          ) : (
                            <BadgeAlert size={16} className="text-red-500" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent
                          className={`${user.emailVerified === true ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {user.emailVerified === true ? (
                            <p className="text-white">
                              Seu e-mail já está verificado.
                            </p>
                          ) : (
                            <p className="text-white">
                              Seu e-mail não está verificado.
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/minha-conta")}
              >
                <Settings /> Minha Conta
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/alertas")}
              >
                <Bell />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
