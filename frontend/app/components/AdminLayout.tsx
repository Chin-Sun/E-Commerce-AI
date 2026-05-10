import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    labelKey: "admin.dashboard" as const,
  },
  {
    href: "/admin/products",
    icon: Package,
    labelKey: "admin.products" as const,
  },
  {
    href: "/admin/orders",
    icon: ShoppingCart,
    labelKey: "admin.orders" as const,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-2">Access Denied</p>
          <p className="text-sm text-muted-foreground mb-4">
            Admin privileges required.
          </p>
          <Button asChild variant="outline">
            <Link href="/">{t("admin.backToStore")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-secondary/20 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary" />
            <span className="text-sm font-bold tracking-tight">ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
            const active = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t("admin.backToStore")}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
