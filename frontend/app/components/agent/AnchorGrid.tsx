import { useI18n } from "@/contexts/I18nContext";
import { AgentProductCard } from "./AgentProductCard";
import type { ProductSummary } from "../../../../backend/src/agents/types";

interface Props {
  anchors: ProductSummary[];
  onAnchorClick: (product: ProductSummary) => void;
}

export function AnchorGrid({ anchors, onAnchorClick }: Props) {
  const { t } = useI18n();

  if (!anchors.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        {t("ai.clarificationBanner")}
      </p>
      <div className="flex flex-col gap-2">
        {anchors.map(product => (
          <button
            key={product.id}
            className="w-full text-left"
            onClick={() => onAnchorClick(product)}
          >
            <AgentProductCard product={product} />
          </button>
        ))}
      </div>
    </div>
  );
}
