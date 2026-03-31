import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";

const STAT_CARDS: {
  key: string;
  icon: any;
  labelKey:
    | "admin.totalProducts"
    | "admin.totalOrders"
    | "admin.revenue"
    | "admin.lowStock";
  color: string;
  prefix?: string;
}[] = [
  {
    key: "totalProducts",
    icon: Package,
    labelKey: "admin.totalProducts",
    color: "text-blue-600",
  },
  {
    key: "totalOrders",
    icon: ShoppingCart,
    labelKey: "admin.totalOrders",
    color: "text-green-600",
  },
  {
    key: "totalRevenue",
    icon: DollarSign,
    labelKey: "admin.revenue",
    color: "text-primary",
    prefix: "$",
  },
  {
    key: "lowStock",
    icon: AlertTriangle,
    labelKey: "admin.lowStock",
    color: "text-amber-600",
  },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="w-8 h-1 bg-primary mb-4" />
        <h1 className="text-2xl font-bold tracking-tight">
          {t("admin.dashboard")}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, icon: Icon, labelKey, color, prefix }) => (
          <Card key={key} className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t(labelKey)}
                </span>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-black tracking-tight">
                {isLoading
                  ? "—"
                  : `${prefix ?? ""}${(stats as any)?.[key] ?? 0}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
