import { useState, useEffect, useRef, useCallback } from "react";
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
import type { AgentStreamEvent } from "../../../server/agent/agentLoop";

type SidePanelData = Pick<AgentResponse, "products" | "anchors" | "comparison" | "status">;

export default function AI() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const [messages, setMessages]         = useState<Message[]>([]);
  const [sideData, setSideData]         = useState<SidePanelData | null>(null);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [toolStatus, setToolStatus]     = useState<string | null>(null);
  // streaming assistant message built token-by-token
  const streamingRef                    = useRef("");
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef                        = useRef<AbortController | null>(null);
  const autoComparedRef                 = useRef(false);

  const transcribeMutation = trpc.ai.transcribe.useMutation();

  const handleTranscribe = async (blob: Blob): Promise<string> => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] ?? result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const result = await transcribeMutation.mutateAsync({
      audioBase64: base64,
      mimeType: blob.type || "audio/webm",
    });
    return result.text;
  };

  const handleSend = useCallback(async (content: string) => {
    if (!isAuthenticated) { openLoginModal(); return; }
    if (isStreaming) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Optimistic user message
    setMessages(prev => [...prev, { role: "user", content }]);
    streamingRef.current = "";
    setStreamingContent("");
    setToolStatus(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: content }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          let event: AgentStreamEvent;
          try { event = JSON.parse(raw) as AgentStreamEvent; } catch { continue; }

          if (event.type === "token") {
            streamingRef.current += event.content;
            setStreamingContent(streamingRef.current);
          } else if (event.type === "tool_start") {
            setToolStatus(event.tools.join(", "));
          } else if (event.type === "result") {
            const resp = event.data;
            setMessages(prev => [
              ...prev,
              { role: "assistant", content: resp.message },
            ]);
            streamingRef.current = "";
            setStreamingContent("");
            setToolStatus(null);
            setSideData({
              products: resp.products,
              anchors: resp.anchors,
              comparison: resp.comparison,
              status: resp.status,
            });
            if (resp.products && resp.products.length >= 2) {
              autoComparedRef.current = false;
            }
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      // Remove optimistic user message
      setMessages(prev => prev.slice(0, -1));
      streamingRef.current = "";
      setStreamingContent("");
      setToolStatus(null);
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setIsStreaming(false);
    }
  }, [isAuthenticated, isStreaming, openLoginModal, t]);

  // Auto-compare after 8s idle with ≥2 products
  useEffect(() => {
    if (
      !sideData?.products ||
      sideData.products.length < 2 ||
      autoComparedRef.current ||
      isStreaming
    ) return;

    const timer = setTimeout(() => {
      if (autoComparedRef.current) return;
      autoComparedRef.current = true;
      handleSend(t("ai.comparePrompt"));
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideData?.products]);

  const handleAnchorClick = (product: ProductSummary) => {
    handleSend(`${product.nameZh || product.nameEn} — tell me more about this product`);
  };

  // Build the message list passed to AIChatBox:
  // while streaming, append a partial assistant message
  const displayMessages: Message[] = streamingContent
    ? [...messages, { role: "assistant", content: streamingContent }]
    : messages;

  const suggestedPrompts = [
    "Show me popular bearings",
    "Stainless steel bolts under $5",
    "Compare different screw types",
    t("ai.suggestCompare"),
  ];

  return (
    <StoreLayout>
      <div className="container py-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t("ai.pageTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("ai.emptyState")}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
            <Sparkles className="size-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("ai.loginPrompt")}</p>
            <Button onClick={openLoginModal}>{t("nav.login")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {toolStatus && isStreaming && !streamingContent && (
                <p className="mb-2 text-xs text-muted-foreground animate-pulse px-1">
                  {toolStatus.replace(/_/g, " ")}…
                </p>
              )}
              <AIChatBox
                messages={displayMessages}
                onSendMessage={handleSend}
                isLoading={isStreaming && !streamingContent}
                placeholder={t("ai.placeholder")}
                emptyStateMessage={t("ai.emptyState")}
                suggestedPrompts={suggestedPrompts}
                height="calc(100vh - 220px)"
                onTranscribe={handleTranscribe}
              />
            </div>

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
