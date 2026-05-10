import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { formatPrice } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import PaymentModal from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ShippingForm {
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  notes: string;
}

const INITIAL_FORM: ShippingForm = {
  shippingName: "",
  shippingEmail: "",
  shippingPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  shippingCountry: "",
  notes: "",
};

export default function Checkout() {
  const { t, tf, locale } = useI18n();
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<ShippingForm>({
    ...INITIAL_FORM,
    shippingName: user?.name ?? "",
    shippingEmail: user?.email ?? "",
  });
  const [pendingOrder, setPendingOrder] = useState<{
    id: number;
    amount: number;
  } | null>(null);

  const { data: cartItems } = trpc.cart.get.useQuery(undefined, {
    enabled: !!user,
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: data => {
      const amount =
        cartItems?.reduce(
          (s, i) => s + Number(i.product?.price ?? 0) * i.quantity,
          0
        ) ?? 0;
      setPendingOrder({ id: data.id, amount });
    },
    onError: err => toast.error(err.message),
  });

  if (!user) {
    openLoginModal();
    return null;
  }

  const subtotal =
    cartItems?.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0
    ) ?? 0;

  const handleChange =
    (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate(form);
  };

  const fields: { key: keyof ShippingForm; label: string; type?: string }[] = [
    { key: "shippingName", label: t("checkout.name") },
    { key: "shippingEmail", label: t("checkout.email"), type: "email" },
    { key: "shippingPhone", label: t("checkout.phone"), type: "tel" },
    { key: "shippingAddress", label: t("checkout.address") },
    { key: "shippingCity", label: t("checkout.city") },
    { key: "shippingState", label: t("checkout.state") },
    { key: "shippingZip", label: t("checkout.zip") },
    { key: "shippingCountry", label: t("checkout.country") },
  ];

  const isPending = createOrder.isPending;

  return (
    <>
      {pendingOrder && (
        <PaymentModal
          open={!!pendingOrder}
          orderId={pendingOrder.id}
          amount={pendingOrder.amount}
          currency="USD"
          onClose={() => setPendingOrder(null)}
          onStripeSuccess={() => navigate(`/orders/${pendingOrder.id}`)}
        />
      )}
      <StoreLayout>
        <div className="container py-8 md:py-12">
          <div className="w-8 h-1 bg-primary mb-4" />
          <h1 className="text-3xl font-bold tracking-tight mb-8">
            {t("checkout.title")}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping form */}
              <div className="lg:col-span-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-6">
                  {t("checkout.shipping")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(({ key, label, type }) => (
                    <div
                      key={key}
                      className={
                        key === "shippingAddress" ? "sm:col-span-2" : ""
                      }
                    >
                      <Label className="text-xs font-medium uppercase tracking-wider">
                        {label}
                      </Label>
                      <Input
                        type={type ?? "text"}
                        value={form[key]}
                        onChange={handleChange(key)}
                        required={key !== "notes"}
                        className="mt-1.5"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium uppercase tracking-wider">
                      {t("checkout.notes")}
                    </Label>
                    <Textarea
                      value={form.notes}
                      onChange={handleChange("notes")}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="border border-border p-6 h-fit sticky top-24">
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">
                  {t("checkout.orderSummary")}
                </h3>
                <Separator className="mb-4" />
                <div className="space-y-3 mb-4">
                  {cartItems?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.product ? tf(item.product, "name") : "Item"} x
                        {item.quantity}
                      </span>
                      <span className="font-medium shrink-0">
                        {formatPrice(Number(item.product?.price ?? 0) * item.quantity, locale)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-bold mb-6">
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(subtotal, locale)}</span>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold tracking-wide"
                  size="lg"
                  disabled={isPending || !cartItems?.length}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      {t("common.loading")}
                    </>
                  ) : (
                    t("checkout.placeOrder")
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </form>
        </div>
      </StoreLayout>
    </>
  );
}
