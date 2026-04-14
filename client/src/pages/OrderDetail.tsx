import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useParams, Link, useSearch } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import PaymentModal from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { formatPrice, type TranslationKey } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function OrderDetail() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const paymentResult = params.get("payment");

  const { data: order, isLoading } = trpc.order.byId.useQuery(
    { id: Number(id) },
    {
      enabled: !!user,
      refetchInterval: paymentResult === "success" ? 3000 : false,
    }
  );

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  useEffect(() => {
    // If order is no longer pending, ensure the payment modal is closed.
    if (order && order.status !== "pending") {
      setPaymentModalOpen(false);
    }
  }, [order]);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!order) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Order not found</p>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PaymentModal
        open={paymentModalOpen}
        orderId={order.id}
        amount={Number(order.totalAmount)}
        currency={order.currency ?? "USD"}
        onClose={() => setPaymentModalOpen(false)}
        // Payment redirect handled by Stripe success/cancel URLs.
        onStripeSuccess={() => {}}
      />
      <div className="container py-8 md:py-12 max-w-3xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("order.title")}
        </Link>

        {/* Payment success banner */}
        {paymentResult === "success" && (
          <div className="bg-green-50 border border-green-200 p-6 mb-8 flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-lg text-green-900">
                Payment Successful
              </h2>
              <p className="text-sm text-green-700">
                Your payment has been processed. Your order status will update
                shortly.
              </p>
            </div>
          </div>
        )}

        {/* Payment cancelled banner */}
        {paymentResult === "cancelled" && (
          <div className="bg-amber-50 border border-amber-200 p-6 mb-8 flex items-start gap-4">
            <XCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-lg text-amber-900">
                Payment Cancelled
              </h2>
              <p className="text-sm text-amber-700">
                Your payment was not completed. You can try again below.
              </p>
            </div>
          </div>
        )}

        {/* Order confirmation banner for new pending orders */}
        {!paymentResult && order.status === "pending" && (
          <div className="bg-primary/5 border border-primary/20 p-6 mb-8 flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-lg">{t("order.confirmation")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("order.confirmationMsg")}
              </p>
            </div>
          </div>
        )}

        {/* Order header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("order.id")}
            {order.id}
          </h1>
          <Badge variant="secondary" className="text-xs">
            {t(`status.${order.status}` as TranslationKey)}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground mb-8">
          {t("order.date")}: {new Date(order.createdAt).toLocaleDateString()}{" "}
          {new Date(order.createdAt).toLocaleTimeString()}
        </div>

        {/* Items */}
        <div className="border border-border mb-6">
          <div className="grid grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground p-3 border-b border-border bg-secondary/30">
            <div className="col-span-2">{t("nav.products")}</div>
            <div className="text-center">{t("product.quantity")}</div>
            <div className="text-right">{t("cart.subtotal")}</div>
          </div>
          {order.items?.map(item => (
            <div
              key={item.id}
              className="grid grid-cols-4 gap-4 items-center p-3 border-b border-border last:border-0"
            >
              <div className="col-span-2">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(Number(item.unitPrice), locale)} each
                </p>
              </div>
              <div className="text-center text-sm">{item.quantity}</div>
              <div className="text-right text-sm font-bold">
                {formatPrice(Number(item.totalPrice), locale)}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <Separator className="mb-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(Number(order.totalAmount), locale)}</span>
            </div>
          </div>
        </div>

        {/* Pay Now button for pending orders */}
        {order.status === "pending" && (
          <div className="mb-8">
            <Button
              className="w-full font-semibold tracking-wide"
              size="lg"
              onClick={() => setPaymentModalOpen(true)}
              disabled={paymentModalOpen}
            >
              <CreditCard className="h-4 w-4 mr-2" /> {t("checkout.payNow")}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Secure payment powered by Stripe
            </p>
          </div>
        )}

        {/* Shipping info */}
        {order.shippingName && (
          <div className="border border-border p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">
              {t("checkout.shipping")}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("checkout.name")}:
                </span>
                <p className="font-medium">{order.shippingName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("checkout.email")}:
                </span>
                <p className="font-medium">{order.shippingEmail}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("checkout.phone")}:
                </span>
                <p className="font-medium">{order.shippingPhone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("checkout.address")}:
                </span>
                <p className="font-medium">
                  {order.shippingAddress}, {order.shippingCity},{" "}
                  {order.shippingState} {order.shippingZip},{" "}
                  {order.shippingCountry}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/orders">{t("common.back")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">{t("cart.continueShopping")}</Link>
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}
