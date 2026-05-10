import { useI18n } from "@/contexts/I18nContext";
import { formatPrice } from "@/lib/i18n";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { Product } from "../../../data/drizzle/schema";

export default function ProductCard({ product }: { product: Product }) {
  const { tf, locale } = useI18n();
  const images = (product.images as string[] | null) ?? [];
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group border border-border hover:border-primary/50 transition-all"
    >
      {/* Image area */}
      <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
        {images.length > 0 && images[0] ? (
          <img
            src={images[0]}
            alt={tf(product, "name")}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/30" />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
          {product.sku}
        </p>
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {tf(product, "name")}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">
            {formatPrice(Number(product.price), locale)}
          </span>
          <Badge
            variant={inStock ? "secondary" : "destructive"}
            className="text-[10px] font-medium"
          >
            {inStock ? `${product.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
