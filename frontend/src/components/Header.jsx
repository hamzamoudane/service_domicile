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
    <header className="sticky top-0 z-50 transition-all duration-300 glass border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" data-testid="nav-logo">
            <div className="relative h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-black text-xl shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-hover:rotate-3">
              S<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emergency border-2 border-background animate-pulse-ring" />
            </div>
            <div className="hidden sm:block leading-[1.1]">
              <div className="font-display font-black tracking-tighter text-lg uppercase group-hover:text-primary transition-colors">SOS Dépannage</div>
              <div className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground/60 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary" /> France · 24h/24
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                data-testid={`nav-${n.id}`}
                className={({ isActive }) =>
                  `px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "text-primary bg-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {t(n.key).replace("nav_", "")}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a
              href="tel:+33180888888"
              className="hidden xl:flex items-center gap-2.5 px-5 h-11 rounded-xl bg-emergency text-emergency-foreground font-black text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-emergency/20"
              data-testid="emergency-call-btn"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Dépannage 24/7</span>
            </a>

            <div className="flex items-center gap-1 h-11 p-1 bg-muted/40 rounded-xl border border-border/50">
                {/* Language toggle */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-background" data-testid="language-toggle">
                      <Languages className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-2 border-border/40 glass">
                    <DropdownMenuItem onClick={() => setLang("fr")} className="rounded-lg font-bold text-xs uppercase tracking-wider">
                      <span className="mr-2 opacity-70">FR</span> Français {lang === "fr" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLang("en")} className="rounded-lg font-bold text-xs uppercase tracking-wider">
                      <span className="mr-2 opacity-70">EN</span> English {lang === "en" && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-4 bg-border/50 mx-1" />

                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-background"
                  onClick={toggle}
                  data-testid="theme-toggle"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative group" data-testid="nav-cart">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary hover:text-primary-foreground group-hover:border-primary transition-all">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-emergency text-emergency-foreground text-[10px] font-black flex items-center justify-center px-1 border-2 border-background shadow-lg">
                  {count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all" data-testid="user-menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-3 border-border/40 glass">
                  <DropdownMenuLabel className="flex items-center gap-3 p-3 mb-2 bg-muted/50 rounded-xl">
                    <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">{user.name.charAt(0)}</div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm tracking-tight">{user.name}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Membre Premium</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <div className="py-2">
                      <DropdownMenuItem asChild className="rounded-lg p-2.5 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <Link to="/account" data-testid="menu-account">
                          <User className="h-3.5 w-3.5 mr-3 opacity-60" /> Mon Espace
                        </Link>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <DropdownMenuItem asChild className="rounded-lg p-2.5 font-bold text-xs uppercase tracking-widest cursor-pointer text-primary">
                          <Link to="/admin" data-testid="menu-admin">
                            <ShieldCheck className="h-3.5 w-3.5 mr-3" /> Console Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                  </div>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-2.5 font-bold text-xs uppercase tracking-widest cursor-pointer text-destructive hover:bg-destructive/10">
                    <LogOut className="h-3.5 w-3.5 mr-3" /> {t("nav_logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <Button variant="ghost" size="sm" className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest" asChild data-testid="nav-login">
                  <Link to="/login">{t("nav_login")}</Link>
                </Button>
                <Button size="sm" className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]" asChild data-testid="nav-register">
                  <Link to="/register">{t("nav_register")}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11 rounded-xl bg-muted/40"
              onClick={() => setOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden pb-6 animate-fade-up" data-testid="mobile-menu">
            <nav className="flex flex-col gap-2 pt-4">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-5 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl border transition-all ${
                      isActive ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-card border-border/50 text-muted-foreground"
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              ))}
              {!user && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>{t("nav_login")}</Link>
                  </Button>
                  <Button className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" asChild>
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
