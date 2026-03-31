import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, CircleDot, Zap, Nut } from "lucide-react";
import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "metal-hardware": <Wrench className="h-6 w-6" />,
  bearings: <CircleDot className="h-6 w-6" />,
  electromechanical: <Zap className="h-6 w-6" />,
  screws: <Nut className="h-6 w-6" />,
};

export default function Home() {
  const { t, tf } = useI18n();
  const { data: categories } = trpc.category.list.useQuery();
  const { data: featured } = trpc.product.featured.useQuery();

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="container py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="w-12 h-12 bg-primary mb-8" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-background/70 mb-10 leading-relaxed max-w-lg">
              {t("home.hero.subtitle")}
            </p>
            <Button
              size="lg"
              asChild
              className="group font-semibold tracking-wide"
            >
              <Link href="/products">
                {t("home.hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Red accent square */}
        <div className="absolute top-12 right-12 w-32 h-32 bg-primary opacity-90 hidden lg:block" />
        <div className="absolute bottom-8 right-48 w-16 h-16 bg-primary/40 hidden lg:block" />
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="w-8 h-1 bg-primary mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("home.categories")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories?.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?cat=${cat.slug}`}
              className="group border border-border p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-primary">{CATEGORY_ICONS[cat.slug]}</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                {tf(cat, "name")}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tf(cat, "desc")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="border-t border-border" />
      </div>

      {/* Featured Products */}
      <section className="container py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="w-8 h-1 bg-primary mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("home.featured")}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {t("home.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured?.items.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-foreground text-background">
        <div className="container py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Need bulk pricing or custom orders?
            </h3>
            <p className="text-background/60 text-sm">
              Contact our sales team for volume discounts and technical support.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="border-background/30 text-background hover:bg-background/10 font-semibold shrink-0"
          >
            Contact Sales
          </Button>
        </div>
      </section>
    </StoreLayout>
  );
}
