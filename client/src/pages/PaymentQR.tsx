/**
 * /payment/qr — opened in a new window by PaymentModal.
 * Shows the WeChat Pay or Alipay QR code and polls for payment confirmation.
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const WECHAT_GREEN = "#07C160";
const ALIPAY_BLUE = "#1677FF";

const POLL_INTERVAL_MS = 3000;

export default function PaymentQR() {
  const { t } = useI18n();
  const params = new URLSearchParams(window.location.search);
  const orderId = Number(params.get("orderId") ?? "0");
  const method = (params.get("method") ?? "wechat") as "wechat" | "alipay";
  const qrData = params.get("qrData") ?? "";
  const amount = params.get("amount") ?? "0";
  const currency = params.get("currency") ?? "CNY";

  const [status, setStatus] = useState<"waiting" | "paid" | "failed">(
    "waiting"
  );

  const orderQuery = trpc.order.byId.useQuery(
    { id: orderId },
    {
      enabled: !!orderId && status === "waiting",
      refetchInterval: POLL_INTERVAL_MS,
    }
  );

  // Watch for order status changes
  useEffect(() => {
    const orderStatus = orderQuery.data?.status;
    if (
      orderStatus === "paid" ||
      orderStatus === "processing" ||
      orderStatus === "shipped" ||
      orderStatus === "delivered"
    ) {
      setStatus("paid");
    } else if (orderStatus === "cancelled") {
      setStatus("failed");
    }
  }, [orderQuery.data?.status]);

  const isWechat = method === "wechat";
  const accentColor = isWechat ? WECHAT_GREEN : ALIPAY_BLUE;
  const methodLabel = isWechat ? t("pay.wechat") : t("pay.alipay");

  // QR code image via free qrserver.com API — no npm package needed
  const qrImageUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&ecc=M&data=${encodeURIComponent(qrData)}`
    : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-sm p-8 flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {isWechat ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <svg viewBox="0 0 40 40" fill="white" className="w-6 h-6">
                <path d="M15.5 9C9.149 9 4 13.477 4 19c0 3.1 1.6 5.87 4.1 7.77L7 30l4.1-2.05A13.6 13.6 0 0015.5 29c.34 0 .676-.014 1.01-.04A8.5 8.5 0 0116 27.5C16 22.806 20.254 19 25.5 19c.347 0 .69.019 1.03.054C25.56 13.45 21.08 9 15.5 9z" />
                <path d="M25.5 21c-4.142 0-7.5 2.91-7.5 6.5S21.358 34 25.5 34c1.1 0 2.14-.24 3.06-.67L32 35l-.9-2.89C32.6 30.9 33 29.24 33 27.5 33 23.91 29.642 21 25.5 21z" />
              </svg>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <svg viewBox="0 0 48 48" fill="white" className="w-6 h-6">
                <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm9.4 27.52c-3.12 1.64-8.84-2.44-11.96-4.96-3.94 1.66-8.28 2.84-11.14 2.02-3.6-1.04-4.5-5.06-1.8-7.36 1.58-1.32 4.36-1.84 7.32-1.6-.44-1.04-.84-2.12-1.16-3.22H12v-1.6h4.46c-.16-.68-.3-1.36-.4-2.04H12v-1.6h3.9c-.06-.62-.1-1.24-.1-1.86 0-.14 0-.28.02-.42h-3.82v-1.6h4.02c.26-3.38 2.22-5.56 5.42-5.56 2.12 0 3.94 1.08 4.64 2.74l-1.82.8c-.44-1.02-1.5-1.74-2.82-1.74-2.06 0-3.24 1.42-3.48 3.76h7.98v1.6h-8.1c-.02.14-.02.28-.02.42 0 .62.04 1.24.1 1.86h8.02v1.6h-7.74c.12.68.26 1.36.44 2.04h7.3v1.6h-6.8c.32 1.06.72 2.1 1.2 3.1 2.58-.1 5.02.18 6.74.88 3.78 1.56 6.98 4.74 5.72 8.1z" />
              </svg>
            </div>
          )}
          <span className="text-xl font-bold">{methodLabel}</span>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-sm text-gray-500">{t("pay.amount")}</p>
          <p
            className="text-3xl font-black tracking-tight"
            style={{ color: accentColor }}
          >
            {currency} {Number(amount).toFixed(2)}
          </p>
        </div>

        {/* QR code / status */}
        {status === "waiting" && (
          <>
            <div
              className="border-4 rounded-lg p-2"
              style={{ borderColor: accentColor }}
            >
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Payment QR Code"
                  width={240}
                  height={240}
                  className="block"
                />
              ) : (
                <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold text-sm">{t("pay.scanQr")}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("pay.waitingPayment")}
              </div>
            </div>
          </>
        )}

        {status === "paid" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2
              className="h-16 w-16"
              style={{ color: accentColor }}
            />
            <p className="text-lg font-bold">{t("pay.paid")}</p>
            <p className="text-sm text-gray-500">You can close this window.</p>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-lg font-bold text-destructive">
              {t("pay.failed")}
            </p>
            <p className="text-sm text-gray-500">You can close this window.</p>
          </div>
        )}

        {/* Order reference */}
        <p className="text-xs text-gray-400">Order #{orderId}</p>
      </div>
    </div>
  );
}
