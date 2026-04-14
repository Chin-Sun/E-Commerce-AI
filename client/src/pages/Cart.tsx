import { useI18n } from "@/contexts/I18nContext";
import { formatPrice } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, Package } from "lucide-react";

export default function Cart() {
  const { t, tf, locale } = useI18n();
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const utils = trpc.useUtils();

  const { data: items, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: !!user,
  });

  const updateQty = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });
  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  if (!user) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-2">
            {t("common.loginRequired")}
          </p>
          <Button onClick={openLoginModal}>{t("nav.login")}</Button>
        </div>
      </StoreLayout>
    );
  }

  const subtotal =
    items?.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0
    ) ?? 0;

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12">
        <div className="w-8 h-1 bg-primary mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {t("cart.title")}
        </h1>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        ) : !items?.length ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-lg text-muted-foreground mb-6">
              {t("cart.empty")}
            </p>
            <Button asChild variant="outline">
              <Link href="/products">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-0">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-3 border-b border-border">
                <div className="col-span-6">{t("nav.products")}</div>
                <div className="col-span-2 text-center">
                  {t("product.price")}
                </div>
                <div className="col-span-2 text-center">
                  {t("product.quantity")}
                </div>
                <div className="col-span-2 text-right">
                  {t("cart.subtotal")}
                </div>
              </div>

              {items.map(item => {
                const price = Number(item.product?.price ?? 0);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border"
                  >
                    <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                      <div className="w-16 h-16 bg-secondary/50 border border-border flex-shrink-0 flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="text-sm font-semibold hover:text-primary line-clamp-1"
                        >
                          {item.product
                            ? tf(item.product, "name")
                            : `Product #${item.productId}`}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {item.product?.sku}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-center text-sm font-medium">
                      {formatPrice(price, locale)}
                    </div>
                    <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQty.mutate({
                              itemId: item.id,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="px-2 py-1 hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="px-2 py-1 hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm font-bold">
                        {formatPrice(price * item.quantity, locale)}
                      </span>
                      <button
                        onClick={() => removeItem.mutate({ itemId: item.id })}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border border-border p-6 h-fit sticky top-24">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">
                {t("checkout.orderSummary")}
              </h3>
              <Separator className="mb-4" />
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {t("cart.subtotal")} ({items.length} {t("cart.items")})
                </span>
                <span className="font-semibold">{formatPrice(subtotal, locale)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-base font-bold mb-6">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <Button
                asChild
                className="w-full font-semibold tracking-wide"
                size="lg"
              >
                <Link href="/checkout">{t("cart.checkout")}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full mt-2" size="sm">
                <Link href="/products">{t("cart.continueShopping")}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
