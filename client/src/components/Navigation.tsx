import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Trophy, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin", icon: Shield },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 min-w-0">
            <span className="text-xl md:text-2xl">🌙</span>
            <span className="font-bold text-xs sm:text-sm md:text-lg text-foreground truncate">
              Ramadan
            </span>
            <span className="hidden md:inline text-xs text-primary ml-2 px-2 py-1 rounded-full bg-primary/10">
              <a href="https://ktlianwears.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Sponsored by Ktlian Wears :)
              </a>
            </span>
          </div>

          <div className="flex items-center gap-0.5 md:gap-1 flex-wrap justify-end flex-shrink-0">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={location === link.href ? "default" : "ghost"}
                size="sm"
                className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
              >
                <Link href={link.href}>
                  <link.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline ml-1">{link.label}</span>
                </Link>
              </Button>
            ))}

            {isAuthenticated && authenticatedLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={location === link.href ? "default" : "ghost"}
                size="sm"
                className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
              >
                <Link href={link.href}>
                  <link.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline ml-1">{link.label}</span>
                </Link>
              </Button>
            ))}

            {isAuthenticated && user?.role === 'admin' && adminLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={location === link.href ? "default" : "ghost"}
                size="sm"
                className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
              >
                <Link href={link.href}>
                  <link.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline ml-1">{link.label}</span>
                </Link>
              </Button>
            ))}

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
              >
                <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="golden-glow text-xs md:text-sm px-2 md:px-3 h-8 md:h-9">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
