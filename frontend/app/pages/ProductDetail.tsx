import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { formatPrice } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, Package, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
  const { t, tf, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = trpc.product.byId.useQuery({
    id: Number(id),
  });
  const { data: categories } = trpc.category.list.useQuery();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(t("product.addToCart") + " ✓");
      utils.cart.get.invalidate();
    },
  });
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/products">{t("common.back")}</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const images = (product.images as string[] | null) ?? [];
  const specs = (product.specs as Record<string, string> | null) ?? {};
  const category = categories?.find(c => c.id === product.categoryId);
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: qty });
  };

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-square bg-secondary/50 border border-border flex items-center justify-center">
            {images.length > 0 && images[0] ? (
              <img
                src={images[0]}
                alt={tf(product, "name")}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-20 w-20 text-muted-foreground/20" />
            )}
          </div>

          {/* Details */}
          <div>
            {category && (
              <Link
                href={`/products?cat=${category.slug}`}
                className="text-xs font-medium text-primary uppercase tracking-widest hover:underline"
              >
                {tf(category, "name")}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 mb-4">
              {tf(product, "name")}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black tracking-tight">
                {formatPrice(Number(product.price), locale)}
              </span>
              <Badge variant={inStock ? "secondary" : "destructive"}>
                {inStock
                  ? `${product.stock} ${t("product.inStock").toLowerCase()}`
                  : t("product.outOfStock")}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {t("product.sku")}: {product.sku}
            </p>

            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">
                {t("product.description")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tf(product, "desc")}
              </p>
            </div>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">
                  {t("product.specs")}
                </h3>
                <div className="border border-border">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex text-sm ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <span className="w-1/3 bg-secondary/50 px-3 py-2 font-medium text-xs uppercase tracking-wider">
                        {key}
                      </span>
                      <span className="flex-1 px-3 py-2 text-muted-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center border-x border-border">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock || addToCart.isPending}
                className="flex-1 font-semibold tracking-wide"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addToCart.isPending
                  ? t("common.loading")
                  : t("product.addToCart")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
