import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { ProductSummary } from "../../../../backend/src/agents/types";

interface Props {
  product: ProductSummary;
  onAddToCart?: () => void;
}

export function AgentProductCard({ product, onAddToCart }: Props) {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(t("ai.addToCart"));
      onAddToCart?.();
    },
  });

  const image = product.images[0];

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3">
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.nameEn}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium leading-tight">
          {product.nameZh || product.nameEn}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            ${product.price}
          </span>
          <Badge
            variant={product.stock > 0 ? "secondary" : "destructive"}
            className="text-[10px] px-1.5 py-0"
          >
            {product.stock > 0 ? t("product.inStock") : t("product.outOfStock")}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2">
            <Link href={`/products/${product.id}`}>{t("ai.viewProduct")}</Link>
          </Button>
          {product.stock > 0 && (
            <Button
              size="sm"
              className="h-7 text-xs px-2"
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate({ productId: product.id, quantity: 1 })}
            >
              {t("ai.addToCart")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
