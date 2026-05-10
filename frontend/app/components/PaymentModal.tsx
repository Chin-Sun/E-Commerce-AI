import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// WeChat Pay green / Alipay blue
const WECHAT_GREEN = "#07C160";
const ALIPAY_BLUE = "#1677FF";

type PaymentModalProps = {
  open: boolean;
  orderId: number;
  amount: number; // display amount
  currency?: string;
  onClose: () => void;
  onStripeSuccess: () => void; // called after Stripe URL is opened
};

export default function PaymentModal({
  open,
  orderId,
  amount,
  currency = "USD",
  onClose,
  onStripeSuccess,
}: PaymentModalProps) {
  const { t } = useI18n();
  const [loadingMethod, setLoadingMethod] = useState<
    "wechat" | "alipay" | "stripe" | null
  >(null);

  const stripeCheckout = trpc.order.checkout.useMutation({
    onSuccess: data => {
      setLoadingMethod(null);
      if (data.url) {
        window.open(data.url, "_blank");
        onStripeSuccess();
        onClose();
      }
    },
    onError: err => {
      setLoadingMethod(null);
      toast.error(err.message);
    },
  });

  const getQr = trpc.order.getPaymentQr.useMutation({
    onSuccess: (data, variables) => {
      setLoadingMethod(null);
      // Open the QR page in a new window
      const params = new URLSearchParams({
        orderId: String(orderId),
        method: variables.method,
        qrData: data.qrData,
        amount: data.amount,
        currency: data.currency,
      });
      window.open(
        `/payment/qr?${params.toString()}`,
        "_blank",
        "width=420,height=560"
      );
      onClose();
    },
    onError: err => {
      setLoadingMethod(null);
      if (err.message.includes("NOT_CONFIGURED")) {
        toast.info(t("pay.comingSoon"));
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleWechat = () => {
    setLoadingMethod("wechat");
    getQr.mutate({ orderId, method: "wechat" });
  };

  const handleAlipay = () => {
    setLoadingMethod("alipay");
    getQr.mutate({ orderId, method: "alipay" });
  };

  const handleStripe = () => {
    setLoadingMethod("stripe");
    stripeCheckout.mutate({ orderId });
  };

  const busy = loadingMethod !== null;

  return (
    <Dialog open={open} onOpenChange={o => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("pay.chooseMethod")}</DialogTitle>
          <DialogDescription>
            {t("pay.amount")}:{" "}
            <span className="font-bold">
              {currency} {amount.toFixed(2)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {/* WeChat Pay */}
          <Button
            className="w-full h-14 text-base font-semibold gap-3 justify-start px-5 text-white"
            style={{ backgroundColor: WECHAT_GREEN }}
            onClick={handleWechat}
            disabled={busy}
          >
            {loadingMethod === "wechat" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                viewBox="0 0 40 40"
                fill="white"
                className="w-6 h-6 shrink-0"
              >
                <path d="M15.5 9C9.149 9 4 13.477 4 19c0 3.1 1.6 5.87 4.1 7.77L7 30l4.1-2.05A13.6 13.6 0 0015.5 29c.34 0 .676-.014 1.01-.04A8.5 8.5 0 0116 27.5C16 22.806 20.254 19 25.5 19c.347 0 .69.019 1.03.054C25.56 13.45 21.08 9 15.5 9z" />
                <path d="M25.5 21c-4.142 0-7.5 2.91-7.5 6.5S21.358 34 25.5 34c1.1 0 2.14-.24 3.06-.67L32 35l-.9-2.89C32.6 30.9 33 29.24 33 27.5 33 23.91 29.642 21 25.5 21z" />
              </svg>
            )}
            {t("pay.wechat")}
          </Button>

          {/* Alipay */}
          <Button
            className="w-full h-14 text-base font-semibold gap-3 justify-start px-5 text-white"
            style={{ backgroundColor: ALIPAY_BLUE }}
            onClick={handleAlipay}
            disabled={busy}
          >
            {loadingMethod === "alipay" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                viewBox="0 0 48 48"
                className="w-6 h-6 shrink-0"
                fill="white"
              >
                <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm9.4 27.52c-3.12 1.64-8.84-2.44-11.96-4.96-3.94 1.66-8.28 2.84-11.14 2.02-3.6-1.04-4.5-5.06-1.8-7.36 1.58-1.32 4.36-1.84 7.32-1.6-.44-1.04-.84-2.12-1.16-3.22H12v-1.6h4.46c-.16-.68-.3-1.36-.4-2.04H12v-1.6h3.9c-.06-.62-.1-1.24-.1-1.86 0-.14 0-.28.02-.42h-3.82v-1.6h4.02c.26-3.38 2.22-5.56 5.42-5.56 2.12 0 3.94 1.08 4.64 2.74l-1.82.8c-.44-1.02-1.5-1.74-2.82-1.74-2.06 0-3.24 1.42-3.48 3.76h7.98v1.6h-8.1c-.02.14-.02.28-.02.42 0 .62.04 1.24.1 1.86h8.02v1.6h-7.74c.12.68.26 1.36.44 2.04h7.3v1.6h-6.8c.32 1.06.72 2.1 1.2 3.1 2.58-.1 5.02.18 6.74.88 3.78 1.56 6.98 4.74 5.72 8.1z" />
              </svg>
            )}
            {t("pay.alipay")}
          </Button>

          {/* Stripe */}
          <Button
            variant="outline"
            className="w-full h-14 text-base font-semibold gap-3 justify-start px-5 border-2"
            onClick={handleStripe}
            disabled={busy}
          >
            {loadingMethod === "stripe" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                viewBox="0 0 60 25"
                className="h-5 w-auto shrink-0"
                fill="none"
              >
                <path
                  fill="#635BFF"
                  d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.08 12.08 0 0 1-4.56.83c-4.04 0-6.83-2.58-6.83-7.06 0-3.96 2.35-7.12 6.3-7.12 3.91 0 5.96 2.86 5.96 7.05 0 .4-.04 1.26-.06 1.38zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20c-1.62 0-2.66-.6-3.33-1.01l-.02 4.53-4.17.89V6.24h3.7l.14 1.02a4.74 4.74 0 0 1 3.43-1.35c3.3 0 5.53 2.93 5.53 6.96C46.23 17.27 43.87 20 40.95 20zm-.74-10.25c-.94 0-1.54.34-1.88.72l.03 5.67c.33.38.9.7 1.85.7 1.56 0 2.5-1.55 2.5-3.55 0-1.96-.95-3.54-2.5-3.54zM28.24 5.04c-1.4 0-2.3.77-2.3 1.96 0 1.2.9 1.85 2.96 2.5 2.88.94 4.4 2.3 4.4 4.8 0 3.11-2.4 5.7-6.56 5.7-1.72 0-3.45-.43-4.48-1V15c1.16.65 2.73 1.13 4.13 1.13 1.57 0 2.52-.69 2.52-1.86 0-1.11-.94-1.78-2.88-2.43C23.5 10.92 22 9.6 22 7.08c0-3.02 2.3-5.54 6.34-5.54 1.5 0 2.93.34 3.84.73v3.95c-.88-.5-2.13-.91-3.94-.91v-.27z"
                />
              </svg>
            )}
            {t("pay.stripe")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
