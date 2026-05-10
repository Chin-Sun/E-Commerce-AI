import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useLoginModal } from "@/contexts/LoginModalContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, MessageSquare, Mail } from "lucide-react";

// WeChat green brand colour
const WECHAT_GREEN = "#07C160";

function EmailSocialTab() {
  const { t } = useI18n();

  // Google OAuth login
  const handleGoogleLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Google "G" logo */}
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border">
        <svg viewBox="0 0 24 24" className="w-10 h-10">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="font-semibold text-base">Google</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("login.emailDesc")}
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full font-semibold border-2 flex items-center gap-3"
        onClick={handleGoogleLogin}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}

function WeChatTab() {
  const { t } = useI18n();

  const handleWeChatLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/wechat/start?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* WeChat logo placeholder */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: WECHAT_GREEN }}
      >
        <svg viewBox="0 0 40 40" fill="white" className="w-12 h-12">
          <path d="M15.5 9C9.149 9 4 13.477 4 19c0 3.1 1.6 5.87 4.1 7.77L7 30l4.1-2.05A13.6 13.6 0 0015.5 29c.34 0 .676-.014 1.01-.04A8.5 8.5 0 0116 27.5C16 22.806 20.254 19 25.5 19c.347 0 .69.019 1.03.054C25.56 13.45 21.08 9 15.5 9z" />
          <path d="M25.5 21c-4.142 0-7.5 2.91-7.5 6.5S21.358 34 25.5 34c1.1 0 2.14-.24 3.06-.67L32 35l-.9-2.89C32.6 30.9 33 29.24 33 27.5 33 23.91 29.642 21 25.5 21z" />
        </svg>
      </div>

      <div className="text-center">
        <p className="font-semibold text-base">{t("login.wechat")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("login.wechatDesc")}
        </p>
      </div>

      <Button
        className="w-full font-semibold"
        style={{ backgroundColor: WECHAT_GREEN, color: "white" }}
        onClick={handleWeChatLogin}
      >
        {t("login.wechatBtn")}
      </Button>

      <p className="text-xs text-muted-foreground text-center px-4">
        WeChat 网站应用扫码登录 · 安全快捷
      </p>
    </div>
  );
}

function PhoneTab() {
  const { t } = useI18n();
  const [phone, setPhone] = useState("");

  const handleAuthingLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    const params = new URLSearchParams({ returnTo });
    if (phone.trim()) params.set("phone", phone.trim());
    window.location.href = `/api/auth/authing/start?${params}`;
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-phone">{t("login.phoneNumber")}</Label>
        <Input
          id="login-phone"
          type="tel"
          placeholder={t("login.phonePlaceholder")}
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <Button className="w-full font-semibold" onClick={handleAuthingLogin}>
        手机号短信验证登录
      </Button>
    </div>
  );
}

export default function LoginModal() {
  const { isOpen, closeLoginModal } = useLoginModal();
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && closeLoginModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("login.title")}</DialogTitle>
          <DialogDescription>{t("login.subtitle")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="email"
              className="flex items-center gap-1 text-xs"
            >
              <Mail className="h-3.5 w-3.5" />
              {t("login.email")}
            </TabsTrigger>
            <TabsTrigger
              value="wechat"
              className="flex items-center gap-1 text-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t("login.wechat")}
            </TabsTrigger>
            <TabsTrigger
              value="phone"
              className="flex items-center gap-1 text-xs"
            >
              <Smartphone className="h-3.5 w-3.5" />
              {t("login.phone")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <EmailSocialTab />
          </TabsContent>

          <TabsContent value="wechat">
            <WeChatTab />
          </TabsContent>

          <TabsContent value="phone">
            <PhoneTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
