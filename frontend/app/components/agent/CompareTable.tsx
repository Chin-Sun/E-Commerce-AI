import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { ComparisonResult } from "../../../../backend/src/agents/types";

interface Props {
  comparison: ComparisonResult;
}

export function CompareTable({ comparison }: Props) {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(t("ai.addToCart"));
    },
  });

  const { products, specDiffs, priceRange, recommendation } = comparison;

  if (products.length < 2) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("ai.comparison")}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("ai.priceRange")}: ${priceRange.min} – ${priceRange.max} {priceRange.currency}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28">
                Spec
              </th>
              {products.map(p => (
                <th key={p.id} className="px-3 py-2 text-left font-medium min-w-[100px]">
                  <Link href={`/products/${p.id}`} className="hover:text-primary transition-colors">
                    {p.nameZh || p.nameEn}
                  </Link>
                  <div className="text-primary font-semibold">${p.price}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Stock row */}
            <tr className="border-b border-border/50">
              <td className="px-3 py-2 text-muted-foreground">{t("product.inStock")}</td>
              {products.map(p => (
                <td key={p.id} className="px-3 py-2">
                  <span className={cn(
                    "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium",
                    p.stock > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {p.stock > 0 ? `${p.stock}` : t("product.outOfStock")}
                  </span>
                </td>
              ))}
            </tr>

            {/* Spec rows */}
            {specDiffs.map(diff => (
              <tr key={diff.key} className={cn(
                "border-b border-border/50",
                diff.hasDifference && "bg-amber-50/50 dark:bg-amber-900/10"
              )}>
                <td className="px-3 py-2 text-muted-foreground capitalize">
                  {diff.key}
                  {diff.hasDifference && (
                    <span className="ml-1 text-amber-500">•</span>
                  )}
                </td>
                {products.map(p => (
                  <td key={p.id} className={cn(
                    "px-3 py-2",
                    diff.hasDifference && "font-medium"
                  )}>
                    {diff.values[p.id] ?? <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5">
          <p className="text-xs font-semibold text-primary mb-1">{t("ai.recommendation")}</p>
          <p className="text-xs text-foreground/80 leading-relaxed">{recommendation}</p>
        </div>
      )}

      {/* Add to cart buttons */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
        {products.map(p => (
          <Button
            key={p.id}
            size="sm"
            variant="outline"
            className="text-xs h-8"
            disabled={p.stock === 0 || addMutation.isPending}
            onClick={() => addMutation.mutate({ productId: p.id, quantity: 1 })}
          >
            {p.nameZh?.split("")[0] || "#"}{p.id} {t("ai.addToCart")}
          </Button>
        ))}
      </div>

      {/* Diff legend */}
      {specDiffs.some(d => d.hasDifference) && (
        <p className="text-[10px] text-muted-foreground">
          <span className="text-amber-500 mr-1">•</span>
          {t("ai.specDiff")}
        </p>
      )}
    </div>
  );
}
