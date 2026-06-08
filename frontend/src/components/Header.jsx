import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, ShoppingCart, Menu, X, User, LogOut, ShieldCheck, Phone, Languages } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", key: "nav_home", id: "home" },
  { to: "/services", key: "nav_services", id: "services" },
  { to: "/shop", key: "nav_shop", id: "shop" },
  { to: "/about", key: "nav_about", id: "about" },
  { to: "/reviews", key: "nav_reviews", id: "reviews" },
  { to: "/faq", key: "nav_faq", id: "faq" },
  { to: "/contact", key: "nav_contact", id: "contact" },
];

export default function Header() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="relative h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold transition-transform group-hover:scale-105">
              S<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emergency animate-pulse-ring" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-display font-extrabold tracking-tight text-base">SOS Dépannage</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">France · 24/7</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                data-testid={`nav-${n.id}`}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-foreground hover:bg-muted ${
                    isActive ? "text-foreground bg-muted" : "text-muted-foreground"
                  }`
                }
              >
                {t(n.key)}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <a
              href="tel:+33180888888"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emergency text-emergency-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              data-testid="emergency-call-btn"
            >
              <Phone className="h-4 w-4" />
              <span>01 80 88 88 88</span>
            </a>

            {/* Language toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="language-toggle" aria-label="Language">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("fr")} data-testid="lang-fr">
                  <span className="mr-2">🇫🇷</span> Français {lang === "fr" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("en")} data-testid="lang-en">
                  <span className="mr-2">🇬🇧</span> English {lang === "en" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              data-testid="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Cart */}
            <Link to="/cart" className="relative" data-testid="nav-cart">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-emergency text-emergency-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" data-testid="menu-account">
                      <User className="h-4 w-4 mr-2" /> {t("nav_account")}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" data-testid="menu-admin">
                        <ShieldCheck className="h-4 w-4 mr-2" /> {t("nav_admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="h-4 w-4 mr-2" /> {t("nav_logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild data-testid="nav-login">
                  <Link to="/login">{t("nav_login")}</Link>
                </Button>
                <Button size="sm" asChild data-testid="nav-register">
                  <Link to="/register">{t("nav_register")}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden pb-4 animate-slide-down" data-testid="mobile-menu">
            <nav className="flex flex-col gap-1 pt-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              ))}
              {!user && (
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>{t("nav_login")}</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/register" onClick={() => setOpen(false)}>{t("nav_register")}</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
