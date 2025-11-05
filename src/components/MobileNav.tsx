import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Calendar, User, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/firebase-utils";
import { Badge } from "@/components/ui/badge";

const mobileNavigation = [
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export const MobileNav = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", currentUser?.uid],
    queryFn: () => currentUser ? getNotifications(currentUser.uid) : [],
    enabled: !!currentUser,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          const showBadge = item.name === "Notifications" && unreadCount > 0 && currentUser;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-smooth relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
