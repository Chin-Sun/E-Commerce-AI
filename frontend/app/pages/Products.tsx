import { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";

export default function Products() {
  const { t, tf } = useI18n();
  const searchParams = new URLSearchParams(useSearch());
  const catSlug = searchParams.get("cat") || "";

  const { data: categories } = trpc.category.list.useQuery();
  const selectedCat = categories?.find(c => c.slug === catSlug);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    selectedCat?.id
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Sync catSlug to categoryId when categories load
  useMemo(() => {
    if (catSlug && categories) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat) setCategoryId(cat.id);
    }
  }, [catSlug, categories]);

  const { data, isLoading } = trpc.product.list.useQuery({
    categoryId,
    search: search || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: 50,
  });

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = !!search || !!categoryId || !!minPrice || !!maxPrice;

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="w-8 h-1 bg-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {selectedCat ? tf(selectedCat, "name") : t("nav.products")}
          </h1>
          {selectedCat && (
            <p className="text-muted-foreground mt-2 max-w-lg">
              {tf(selectedCat, "desc")}
            </p>
          )}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("nav.search")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={categoryId?.toString() ?? "all"}
            onValueChange={v =>
              setCategoryId(v === "all" ? undefined : Number(v))
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("product.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("home.viewAll")}</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {tf(cat, "name")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-primary text-primary" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="border border-border p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                {t("product.priceRange")}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive"
              >
                <X className="h-3.5 w-3.5 mr-1" /> {t("product.clearFilter")}
              </Button>
            )}
          </div>
        )}

        {/* Results count */}
        {data && (
          <p className="text-sm text-muted-foreground mb-6">
            {t("product.showing")}{" "}
            <span className="font-semibold text-foreground">
              {data.items.length}
            </span>{" "}
            {t("product.of")}{" "}
            <span className="font-semibold text-foreground">{data.total}</span>{" "}
            {t("product.results")}
          </p>
        )}

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">{t("product.noResults")}</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
