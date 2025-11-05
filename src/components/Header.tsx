import { Search, Bell, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/firebase-utils";
import logo from '../../public/logo.png';

export const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", currentUser?.uid],
    queryFn: () => currentUser ? getNotifications(currentUser.uid) : [],
    enabled: !!currentUser,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationsClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/notifications");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 animate-fade-in">
      <div className="flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
        {/* Logo - Mobile Only */}
        <div className="flex lg:hidden items-center gap-2">
         
            <img className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"src={logo} alt="CampusPal Logo" />
          
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {currentUser && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-smooth">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
