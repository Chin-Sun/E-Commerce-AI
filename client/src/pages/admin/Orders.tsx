import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { TranslationKey } from "@/lib/i18n";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  paid: "default",
  processing: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export default function AdminOrders() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.orders.list.useQuery();

  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.admin.orders.list.invalidate();
    },
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="w-8 h-1 bg-primary mb-3" />
        <h1 className="text-2xl font-bold tracking-tight">
          {t("admin.orders")}
        </h1>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("order.id")}
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("order.date")}
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Customer
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("order.total")}
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("order.status")}
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("admin.updateStatus")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("common.loading")}
                </td>
              </tr>
            ) : !data?.items.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("order.empty")}
                </td>
              </tr>
            ) : (
              data.items.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3 font-semibold">#{order.id}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {order.shippingName || `User #${order.userId}`}
                  </td>
                  <td className="p-3 text-right font-bold">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={STATUS_VARIANT[order.status] ?? "secondary"}
                    >
                      {t(`status.${order.status}` as TranslationKey)}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Select
                      value={order.status}
                      onValueChange={v =>
                        updateStatus.mutate({ id: order.id, status: v as any })
                      }
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => (
                          <SelectItem key={s} value={s}>
                            {t(`status.${s}` as TranslationKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
