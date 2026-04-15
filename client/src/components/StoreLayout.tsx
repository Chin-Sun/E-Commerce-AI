import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs font-medium tracking-wide uppercase"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(
          ([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setLocale(key)}
              className={locale === key ? "bg-accent font-semibold" : ""}
            >
              {label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CartBadge() {
  const { user } = useAuth();
  const { data: cartItems } = trpc.cart.get.useQuery(undefined, {
    enabled: !!user,
  });
  const count = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
          {count}
        </Badge>
      )}
    </Link>
  );
}

function NavLinks({
  mobile,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const { t } = useI18n();
  const [location] = useLocation();
  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
  ];

  const cls = mobile
    ? "flex flex-col gap-1 py-2"
    : "hidden md:flex items-center gap-1";

  return (
    <nav className={cls}>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors hover:text-primary ${
            location === link.href ? "text-primary" : "text-foreground/70"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const { openLoginModal } = useLoginModal();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo/logo.png" alt="ZHENDA MARKET" className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-tight">ZHENDA MARKET</span>
        </Link>

        {/* Desktop Nav */}
        <NavLinks />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated && <CartBadge />}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">
                    {user?.name || t("nav.account")}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> {t("nav.account")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2">
                    <Package className="h-4 w-4" /> {t("nav.orders")}
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" /> {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="font-medium" onClick={openLoginModal}>
              {t("nav.login")}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <NavLinks mobile onClose={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 bg-primary" />
              <span className="text-base font-bold tracking-tight">
                HARDWAREMART
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Your trusted source for industrial hardware, precision bearings,
              electromechanical components, and fasteners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-foreground">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("nav.products")}
              </Link>
              <Link
                href="/products?cat=metal-hardware"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("cat.metal-hardware")}
              </Link>
              <Link
                href="/products?cat=bearings"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("cat.bearings")}
              </Link>
              <Link
                href="/products?cat=electromechanical"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("cat.electromechanical")}
              </Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-foreground">
              Information
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                {t("footer.about")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("footer.contact")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("footer.terms")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("footer.privacy")}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            &copy; {new Date().getFullYear()} HardwareMart. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
