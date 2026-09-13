import { LogOutIcon, ChevronDown, BadgeCheck, BadgeAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/getInitials";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useLogout } from "@/hooks/useLogout";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function NavUser() {
  const logout = useLogout();
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="max-w-50 w-full py-1 px-2 flex items-center border border-muted-foreground/30 rounded-lg">
          <Avatar className="h-10 w-10 rounded-md mr-2">
            <AvatarImage src={user.image ?? undefined} alt={user.email} />
            <AvatarFallback className="bg-accent text-accent-foreground font-medium">
              {getInitials(user.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <p className="truncate font-black">{user.name ?? user.email}</p>
            {/* <p className="truncate text-xs">{user.email}</p> */}
            <p className="truncate text-xs text-muted-foreground lowercase first-letter:uppercase!">
              {user.role}
            </p>
          </div>
          <ChevronDown size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-full">
          <DropdownMenuGroup>
            <div className="text-sm flex items-center gap-x-1 py-1 px-1.5">
              <p className="text-muted-foreground">{user.email}</p>
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
                    <p className="text-white">Seu e-mail já está verificado.</p>
                  ) : (
                    <p className="text-white">
                      Seu e-mail não está verificado.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
