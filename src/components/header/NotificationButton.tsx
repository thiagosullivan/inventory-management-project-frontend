import { useUnreadCount } from "@/hooks/useNotifications";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/button";
import { Badge } from "../ui/badge";

export function NotificationButton() {
  const { data: unreadCount = 0 } = useUnreadCount();
  return (
    <Link
      to="/alertas"
      className={`relative ${buttonVariants({ size: "icon" })} w-8 h-8 lg:w-12 lg:h-12 bg-transparent hover:bg-blue-solid! lg:bg-muted-foreground/30 text-foreground! cursor-pointer`}
      aria-label="Notificações"
    >
      <Bell className="h-6! w-6! lg:h-5 lg:w-5" />
      {unreadCount > 0 && (
        <Badge
          // variant="destructive"
          className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-red-500 text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
