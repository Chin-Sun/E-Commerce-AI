import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoreLayout from "@/components/StoreLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { AgentSidePanel } from "@/components/agent/AgentSidePanel";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { AgentResponse, ProductSummary } from "../../../server/agent/types";

type SidePanelData = Pick<AgentResponse, "products" | "anchors" | "comparison" | "status">;

export default function AI() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a proactive hardware product expert. Reply in the user's language. " +
        "Search products before answering. Compare proactively when the user is undecided.",
    },
  ]);
  const [sideData, setSideData] = useState<SidePanelData | null>(null);
  // Track whether auto-compare has fired for the current product set
  const autoComparedRef = useRef(false);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (resp: AgentResponse) => {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: resp.message },
      ]);
      setSideData({
        products: resp.products,
        anchors: resp.anchors,
        comparison: resp.comparison,
        status: resp.status,
      });
      if (resp.products && resp.products.length >= 2) {
        autoComparedRef.current = false;
      }
    },
    onError: (err) => {
      // Remove the optimistic user message on failure
      setMessages(prev => prev.slice(0, -1));
      toast.error(err.message ?? t("common.error"));
    },
  });

  const handleSend = (content: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    const updated: Message[] = [...messages, { role: "user", content }];
    setMessages(updated);
    chatMutation.mutate({ messages: updated });
  };

  // ── Hesitation detection: 8s idle after ≥2 products → auto-compare ──────────
  useEffect(() => {
    if (
      !sideData?.products ||
      sideData.products.length < 2 ||
      autoComparedRef.current ||
      chatMutation.isPending
    )
      return;

    const timer = setTimeout(() => {
      if (autoComparedRef.current) return;
      autoComparedRef.current = true;
      handleSend(t("ai.comparePrompt"));
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideData?.products]);

  // Handler when user clicks an anchor card (sends its name as next message)
  const handleAnchorClick = (product: ProductSummary) => {
    handleSend(`${product.nameZh || product.nameEn} — tell me more about this product`);
  };

  const suggestedPrompts = [
    "Show me popular bearings",
    "Stainless steel bolts under $5",
    "Compare different screw types",
    t("ai.suggestCompare"),
  ];

  return (
    <StoreLayout>
      <div className="container py-6">
        {/* Page header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t("ai.pageTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("ai.emptyState")}</p>
          </div>
        </div>

        {/* Login gate */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
            <Sparkles className="size-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("ai.loginPrompt")}</p>
            <Button onClick={openLoginModal}>{t("nav.login")}</Button>
          </div>
        ) : (
          /* Two-column layout */
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Chat — 3/5 width on desktop */}
            <div className="lg:col-span-3">
              <AIChatBox
                messages={messages}
                onSendMessage={handleSend}
                isLoading={chatMutation.isPending}
                placeholder={t("ai.placeholder")}
                emptyStateMessage={t("ai.emptyState")}
                suggestedPrompts={suggestedPrompts}
                height="calc(100vh - 220px)"
              />
            </div>

            {/* Side panel — 2/5 width on desktop, below on mobile */}
            <div className="lg:col-span-2">
              <div
                className="rounded-lg border border-border bg-card overflow-hidden"
                style={{ height: "calc(100vh - 220px)" }}
              >
                <AgentSidePanel
                  data={sideData}
                  onAnchorClick={handleAnchorClick}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
