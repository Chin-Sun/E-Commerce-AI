import { Sparkles } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { AgentProductCard } from "./AgentProductCard";
import { AnchorGrid } from "./AnchorGrid";
import { CompareTable } from "./CompareTable";
import type { AgentResponse, ProductSummary } from "../../../../backend/src/agents/types";

type SidePanelData = Pick<AgentResponse, "products" | "anchors" | "comparison" | "status">;

interface Props {
  data: SidePanelData | null;
  onAnchorClick: (product: ProductSummary) => void;
}

export function AgentSidePanel({ data, onAnchorClick }: Props) {
  const { t } = useI18n();

  // Priority: comparison > clarification anchors > product list > empty
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground p-6">
        <Sparkles className="size-10 opacity-20" />
        <p className="text-sm text-center">{t("ai.productsFound")}</p>
      </div>
    );
  }

  if (data.comparison && data.comparison.products.length >= 2) {
    return (
      <div className="p-4 overflow-y-auto h-full">
        <CompareTable comparison={data.comparison} />
      </div>
    );
  }

  if (data.status === "NEED_CLARIFICATION" && data.anchors?.length) {
    return (
      <div className="p-4 overflow-y-auto h-full">
        <AnchorGrid anchors={data.anchors} onAnchorClick={onAnchorClick} />
      </div>
    );
  }

  if (data.products?.length) {
    return (
      <div className="p-4 overflow-y-auto h-full flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("ai.productsFound")} ({data.products.length})
        </p>
        {data.products.map(product => (
          <AgentProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground p-6">
      <Sparkles className="size-10 opacity-20" />
      <p className="text-sm text-center">{t("ai.emptyState")}</p>
    </div>
  );
}
