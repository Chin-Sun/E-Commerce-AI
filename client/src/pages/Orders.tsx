import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { getLoginUrl } from "@/const";
import type { TranslationKey } from "@/lib/i18n";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  paid: "default",
  processing: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export default function Orders() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: orders, isLoading } = trpc.order.myOrders.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <p className="text-lg font-medium mb-4">
            {t("common.loginRequired")}
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>{t("nav.login")}</a>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12">
        <div className="w-8 h-1 bg-primary mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {t("order.title")}
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-lg text-muted-foreground mb-6">
              {t("order.empty")}
            </p>
            <Button asChild variant="outline">
              <Link href="/products">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <div className="border border-border">
            {/* Header */}
            <div className="hidden md:grid grid-cols-5 gap-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground p-4 border-b border-border bg-secondary/30">
              <div>{t("order.id")}</div>
              <div>{t("order.date")}</div>
              <div>{t("order.status")}</div>
              <div>{t("order.total")}</div>
              <div></div>
            </div>
            {orders.map(order => (
              <div
                key={order.id}
                className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center p-4 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
              >
                <div className="font-semibold text-sm">#{order.id}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                    {t(`status.${order.status}` as TranslationKey)}
                  </Badge>
                </div>
                <div className="font-bold text-sm">
                  ${Number(order.totalAmount).toFixed(2)}
                </div>
                <div className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/orders/${order.id}`}>
                      {t("order.details")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
