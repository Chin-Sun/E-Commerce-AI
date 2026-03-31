import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Package, ShoppingCart, User, LogOut } from "lucide-react";

export default function Account() {
  const { t } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const { data: orders } = trpc.order.myOrders.useQuery(undefined, {
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12 max-w-2xl">
        <div className="w-8 h-1 bg-primary mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {t("nav.account")}
        </h1>

        {/* Profile card */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.name ?? "User"}</h2>
              <p className="text-sm text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Role
              </span>
              <p className="font-medium capitalize">{user?.role ?? "user"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Member Since
              </span>
              <p className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/orders"
            className="border border-border p-4 hover:bg-secondary/30 transition-colors flex items-center gap-3"
          >
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{t("nav.orders")}</p>
              <p className="text-xs text-muted-foreground">
                {orders?.length ?? 0} orders
              </p>
            </div>
          </Link>
          <Link
            href="/cart"
            className="border border-border p-4 hover:bg-secondary/30 transition-colors flex items-center gap-3"
          >
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{t("nav.cart")}</p>
              <p className="text-xs text-muted-foreground">View your cart</p>
            </div>
          </Link>
        </div>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="block border border-primary/20 bg-primary/5 p-4 mb-6 hover:bg-primary/10 transition-colors"
          >
            <p className="font-semibold text-primary">
              {t("nav.admin")} Dashboard
            </p>
            <p className="text-xs text-muted-foreground">
              Manage products, orders, and inventory
            </p>
          </Link>
        )}

        <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          {t("nav.logout")}
        </Button>
      </div>
    </StoreLayout>
  );
}
