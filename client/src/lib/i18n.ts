export type Locale = "en" | "zh" | "zhTw" | "ms";

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "简体中文",
  en: "English",
  zhTw: "繁體中文",
  ms: "Bahasa Melayu",
};

export const LOCALE_CURRENCY: Record<Locale, string> = {
  zh: "¥",
  en: "US$",
  zhTw: "¥",
  ms: "RM",
};

export function formatPrice(amount: number, locale: Locale): string {
  return `${LOCALE_CURRENCY[locale]}${amount.toFixed(2)}`;
}

const translations = {
  /* ─── Navigation ─── */
  "nav.home": { en: "Home", zh: "首页", zhTw: "首頁", ms: "Laman Utama" },
  "nav.products": { en: "Products", zh: "产品", zhTw: "產品", ms: "Produk" },
  "nav.cart": { en: "Cart", zh: "购物车", zhTw: "購物車", ms: "Troli" },
  "nav.orders": { en: "Orders", zh: "订单", zhTw: "訂單", ms: "Pesanan" },
  "nav.account": { en: "Account", zh: "账户", zhTw: "帳戶", ms: "Akaun" },
  "nav.admin": { en: "Admin", zh: "管理", zhTw: "管理", ms: "Pentadbir" },
  "nav.login": { en: "Sign In", zh: "登录", zhTw: "登入", ms: "Log Masuk" },
  "nav.logout": { en: "Sign Out", zh: "退出", zhTw: "登出", ms: "Log Keluar" },
  "nav.search": {
    en: "Search products...",
    zh: "搜索产品...",
    zhTw: "搜尋產品...",
    ms: "Cari produk...",
  },

  /* ─── Categories ─── */
  "cat.metal-hardware": {
    en: "Metal Hardware",
    zh: "金属五金",
    zhTw: "金屬五金",
    ms: "Perkakasan Logam",
  },
  "cat.bearings": { en: "Bearings", zh: "轴承", zhTw: "軸承", ms: "Galas" },
  "cat.electromechanical": {
    en: "Electromechanical",
    zh: "机电元件",
    zhTw: "機電元件",
    ms: "Elektromekanikal",
  },
  "cat.screws": {
    en: "Screws & Fasteners",
    zh: "螺丝和紧固件",
    zhTw: "螺絲和緊固件",
    ms: "Skru & Pengikat",
  },

  /* ─── Home Page ─── */
  "home.hero.title": {
    en: "Industrial Hardware Solutions",
    zh: "工业五金解决方案",
    zhTw: "工業五金解決方案",
    ms: "Penyelesaian Perkakasan Industri",
  },
  "home.hero.subtitle": {
    en: "Precision components for engineering excellence",
    zh: "卓越工程的精密组件",
    zhTw: "卓越工程的精密組件",
    ms: "Komponen ketepatan untuk kecemerlangan kejuruteraan",
  },
  "home.hero.cta": {
    en: "Browse Catalog",
    zh: "浏览目录",
    zhTw: "瀏覽目錄",
    ms: "Layari Katalog",
  },
  "home.categories": {
    en: "Product Categories",
    zh: "产品分类",
    zhTw: "產品分類",
    ms: "Kategori Produk",
  },
  "home.featured": {
    en: "Featured Products",
    zh: "精选产品",
    zhTw: "精選產品",
    ms: "Produk Pilihan",
  },
  "home.viewAll": {
    en: "View All",
    zh: "查看全部",
    zhTw: "查看全部",
    ms: "Lihat Semua",
  },

  /* ─── Product ─── */
  "product.addToCart": {
    en: "Add to Cart",
    zh: "加入购物车",
    zhTw: "加入購物車",
    ms: "Tambah ke Troli",
  },
  "product.outOfStock": {
    en: "Out of Stock",
    zh: "缺货",
    zhTw: "缺貨",
    ms: "Kehabisan Stok",
  },
  "product.inStock": {
    en: "In Stock",
    zh: "有库存",
    zhTw: "有庫存",
    ms: "Ada Stok",
  },
  "product.specs": {
    en: "Specifications",
    zh: "规格参数",
    zhTw: "規格參數",
    ms: "Spesifikasi",
  },
  "product.description": {
    en: "Description",
    zh: "描述",
    zhTw: "描述",
    ms: "Penerangan",
  },
  "product.sku": { en: "SKU", zh: "货号", zhTw: "貨號", ms: "SKU" },
  "product.price": { en: "Price", zh: "价格", zhTw: "價格", ms: "Harga" },
  "product.quantity": {
    en: "Quantity",
    zh: "数量",
    zhTw: "數量",
    ms: "Kuantiti",
  },
  "product.category": {
    en: "Category",
    zh: "分类",
    zhTw: "分類",
    ms: "Kategori",
  },
  "product.filter": { en: "Filter", zh: "筛选", zhTw: "篩選", ms: "Tapis" },
  "product.clearFilter": {
    en: "Clear Filters",
    zh: "清除筛选",
    zhTw: "清除篩選",
    ms: "Kosongkan Tapisan",
  },
  "product.priceRange": {
    en: "Price Range",
    zh: "价格范围",
    zhTw: "價格範圍",
    ms: "Julat Harga",
  },
  "product.noResults": {
    en: "No products found",
    zh: "未找到产品",
    zhTw: "未找到產品",
    ms: "Tiada produk ditemui",
  },
  "product.showing": {
    en: "Showing",
    zh: "显示",
    zhTw: "顯示",
    ms: "Menunjukkan",
  },
  "product.of": { en: "of", zh: "共", zhTw: "共", ms: "daripada" },
  "product.results": {
    en: "results",
    zh: "个结果",
    zhTw: "個結果",
    ms: "keputusan",
  },

  /* ─── Cart ─── */
  "cart.title": {
    en: "Shopping Cart",
    zh: "购物车",
    zhTw: "購物車",
    ms: "Troli Beli-belah",
  },
  "cart.empty": {
    en: "Your cart is empty",
    zh: "购物车为空",
    zhTw: "購物車為空",
    ms: "Troli anda kosong",
  },
  "cart.continueShopping": {
    en: "Continue Shopping",
    zh: "继续购物",
    zhTw: "繼續購物",
    ms: "Teruskan Membeli-belah",
  },
  "cart.subtotal": {
    en: "Subtotal",
    zh: "小计",
    zhTw: "小計",
    ms: "Jumlah Kecil",
  },
  "cart.total": { en: "Total", zh: "总计", zhTw: "總計", ms: "Jumlah" },
  "cart.checkout": {
    en: "Proceed to Checkout",
    zh: "去结算",
    zhTw: "去結算",
    ms: "Teruskan ke Pembayaran",
  },
  "cart.remove": { en: "Remove", zh: "移除", zhTw: "移除", ms: "Buang" },
  "cart.items": { en: "items", zh: "件商品", zhTw: "件商品", ms: "item" },

  /* ─── Checkout ─── */
  "checkout.title": {
    en: "Checkout",
    zh: "结算",
    zhTw: "結算",
    ms: "Pembayaran",
  },
  "checkout.shipping": {
    en: "Shipping Information",
    zh: "收货信息",
    zhTw: "收貨資訊",
    ms: "Maklumat Penghantaran",
  },
  "checkout.name": {
    en: "Full Name",
    zh: "姓名",
    zhTw: "姓名",
    ms: "Nama Penuh",
  },
  "checkout.email": { en: "Email", zh: "邮箱", zhTw: "電子郵件", ms: "E-mel" },
  "checkout.phone": { en: "Phone", zh: "电话", zhTw: "電話", ms: "Telefon" },
  "checkout.address": { en: "Address", zh: "地址", zhTw: "地址", ms: "Alamat" },
  "checkout.city": { en: "City", zh: "城市", zhTw: "城市", ms: "Bandar" },
  "checkout.state": {
    en: "State/Province",
    zh: "省/州",
    zhTw: "省/州",
    ms: "Negeri",
  },
  "checkout.zip": {
    en: "Postal Code",
    zh: "邮编",
    zhTw: "郵遞區號",
    ms: "Poskod",
  },
  "checkout.country": { en: "Country", zh: "国家", zhTw: "國家", ms: "Negara" },
  "checkout.notes": {
    en: "Order Notes",
    zh: "订单备注",
    zhTw: "訂單備註",
    ms: "Nota Pesanan",
  },
  "checkout.orderSummary": {
    en: "Order Summary",
    zh: "订单摘要",
    zhTw: "訂單摘要",
    ms: "Ringkasan Pesanan",
  },
  "checkout.placeOrder": {
    en: "Place Order",
    zh: "提交订单",
    zhTw: "提交訂單",
    ms: "Buat Pesanan",
  },
  "checkout.payNow": {
    en: "Pay Now",
    zh: "立即支付",
    zhTw: "立即支付",
    ms: "Bayar Sekarang",
  },

  /* ─── Orders ─── */
  "order.title": {
    en: "My Orders",
    zh: "我的订单",
    zhTw: "我的訂單",
    ms: "Pesanan Saya",
  },
  "order.id": {
    en: "Order #",
    zh: "订单号 #",
    zhTw: "訂單號 #",
    ms: "Pesanan #",
  },
  "order.date": { en: "Date", zh: "日期", zhTw: "日期", ms: "Tarikh" },
  "order.status": { en: "Status", zh: "状态", zhTw: "狀態", ms: "Status" },
  "order.total": { en: "Total", zh: "总额", zhTw: "總額", ms: "Jumlah" },
  "order.details": {
    en: "View Details",
    zh: "查看详情",
    zhTw: "查看詳情",
    ms: "Lihat Butiran",
  },
  "order.empty": {
    en: "No orders yet",
    zh: "暂无订单",
    zhTw: "暫無訂單",
    ms: "Belum ada pesanan",
  },
  "order.confirmation": {
    en: "Order Confirmed",
    zh: "订单已确认",
    zhTw: "訂單已確認",
    ms: "Pesanan Disahkan",
  },
  "order.confirmationMsg": {
    en: "Thank you for your order!",
    zh: "感谢您的订单！",
    zhTw: "感謝您的訂單！",
    ms: "Terima kasih atas pesanan anda!",
  },

  /* ─── Status Labels ─── */
  "status.pending": {
    en: "Pending",
    zh: "待处理",
    zhTw: "待處理",
    ms: "Menunggu",
  },
  "status.paid": { en: "Paid", zh: "已付款", zhTw: "已付款", ms: "Dibayar" },
  "status.processing": {
    en: "Processing",
    zh: "处理中",
    zhTw: "處理中",
    ms: "Memproses",
  },
  "status.shipped": {
    en: "Shipped",
    zh: "已发货",
    zhTw: "已發貨",
    ms: "Dihantar",
  },
  "status.delivered": {
    en: "Delivered",
    zh: "已送达",
    zhTw: "已送達",
    ms: "Dihantar",
  },
  "status.cancelled": {
    en: "Cancelled",
    zh: "已取消",
    zhTw: "已取消",
    ms: "Dibatalkan",
  },

  /* ─── Admin ─── */
  "admin.dashboard": {
    en: "Dashboard",
    zh: "仪表盘",
    zhTw: "儀表板",
    ms: "Papan Pemuka",
  },
  "admin.products": {
    en: "Products",
    zh: "产品管理",
    zhTw: "產品管理",
    ms: "Pengurusan Produk",
  },
  "admin.orders": {
    en: "Orders",
    zh: "订单管理",
    zhTw: "訂單管理",
    ms: "Pengurusan Pesanan",
  },
  "admin.inventory": {
    en: "Inventory",
    zh: "库存",
    zhTw: "庫存",
    ms: "Inventori",
  },
  "admin.totalProducts": {
    en: "Total Products",
    zh: "产品总数",
    zhTw: "產品總數",
    ms: "Jumlah Produk",
  },
  "admin.totalOrders": {
    en: "Total Orders",
    zh: "订单总数",
    zhTw: "訂單總數",
    ms: "Jumlah Pesanan",
  },
  "admin.revenue": { en: "Revenue", zh: "收入", zhTw: "收入", ms: "Hasil" },
  "admin.lowStock": {
    en: "Low Stock",
    zh: "低库存",
    zhTw: "低庫存",
    ms: "Stok Rendah",
  },
  "admin.addProduct": {
    en: "Add Product",
    zh: "添加产品",
    zhTw: "新增產品",
    ms: "Tambah Produk",
  },
  "admin.editProduct": {
    en: "Edit Product",
    zh: "编辑产品",
    zhTw: "編輯產品",
    ms: "Edit Produk",
  },
  "admin.deleteProduct": {
    en: "Delete Product",
    zh: "删除产品",
    zhTw: "刪除產品",
    ms: "Padam Produk",
  },
  "admin.updateStatus": {
    en: "Update Status",
    zh: "更新状态",
    zhTw: "更新狀態",
    ms: "Kemas Kini Status",
  },
  "admin.save": { en: "Save", zh: "保存", zhTw: "儲存", ms: "Simpan" },
  "admin.cancel": { en: "Cancel", zh: "取消", zhTw: "取消", ms: "Batal" },
  "admin.confirm": { en: "Confirm", zh: "确认", zhTw: "確認", ms: "Sahkan" },
  "admin.actions": { en: "Actions", zh: "操作", zhTw: "操作", ms: "Tindakan" },
  "admin.backToStore": {
    en: "Back to Store",
    zh: "返回商店",
    zhTw: "返回商店",
    ms: "Kembali ke Kedai",
  },

  /* ─── Common ─── */
  "common.loading": {
    en: "Loading...",
    zh: "加载中...",
    zhTw: "載入中...",
    ms: "Memuatkan...",
  },
  "common.error": {
    en: "Something went wrong",
    zh: "出了点问题",
    zhTw: "出了點問題",
    ms: "Sesuatu telah berlaku",
  },
  "common.retry": { en: "Retry", zh: "重试", zhTw: "重試", ms: "Cuba Semula" },
  "common.back": { en: "Back", zh: "返回", zhTw: "返回", ms: "Kembali" },
  "common.required": {
    en: "Required",
    zh: "必填",
    zhTw: "必填",
    ms: "Diperlukan",
  },
  "common.loginRequired": {
    en: "Please sign in to continue",
    zh: "请登录以继续",
    zhTw: "請登入以繼續",
    ms: "Sila log masuk untuk meneruskan",
  },

  /* ─── Login Modal ─── */
  "login.title": { en: "Sign In", zh: "登录", zhTw: "登入", ms: "Log Masuk" },
  "login.subtitle": {
    en: "Sign in to add items to cart and place orders",
    zh: "登录后可加入购物车和下单",
    zhTw: "登入後可加入購物車並下單",
    ms: "Log masuk untuk menambah item ke troli",
  },
  "login.wechat": {
    en: "WeChat Login",
    zh: "微信扫码登录",
    zhTw: "微信掃碼登入",
    ms: "Log Masuk WeChat",
  },
  "login.wechatDesc": {
    en: "Scan the QR code with WeChat App",
    zh: "使用微信扫一扫登录",
    zhTw: "使用微信掃一掃登入",
    ms: "Imbas kod QR dengan aplikasi WeChat",
  },
  "login.wechatBtn": {
    en: "Continue with WeChat",
    zh: "微信登录",
    zhTw: "微信登入",
    ms: "Teruskan dengan WeChat",
  },
  "login.phone": {
    en: "Phone Login",
    zh: "手机号登录",
    zhTw: "手機號登入",
    ms: "Log Masuk Telefon",
  },
  "login.phoneNumber": {
    en: "Phone Number",
    zh: "手机号码",
    zhTw: "手機號碼",
    ms: "Nombor Telefon",
  },
  "login.phonePlaceholder": {
    en: "+86 138 0000 0000",
    zh: "+86 138 0000 0000",
    zhTw: "+86 138 0000 0000",
    ms: "+60 12 000 0000",
  },
  "login.sendCode": {
    en: "Send Code",
    zh: "发送验证码",
    zhTw: "發送驗證碼",
    ms: "Hantar Kod",
  },
  "login.resendCode": {
    en: "Resend ({s}s)",
    zh: "重新发送 ({s}秒)",
    zhTw: "重新發送 ({s}秒)",
    ms: "Hantar semula ({s}s)",
  },
  "login.verifyCode": {
    en: "Verification Code",
    zh: "验证码",
    zhTw: "驗證碼",
    ms: "Kod Pengesahan",
  },
  "login.verifyPlaceholder": {
    en: "6-digit code",
    zh: "6位验证码",
    zhTw: "6位驗證碼",
    ms: "Kod 6 digit",
  },
  "login.verify": {
    en: "Verify & Sign In",
    zh: "验证并登录",
    zhTw: "驗證並登入",
    ms: "Sahkan & Log Masuk",
  },
  "login.codeSent": {
    en: "Code sent!",
    zh: "验证码已发送！",
    zhTw: "驗證碼已發送！",
    ms: "Kod dihantar!",
  },
  "login.codeError": {
    en: "Invalid or expired code",
    zh: "验证码无效或已过期",
    zhTw: "驗證碼無效或已過期",
    ms: "Kod tidak sah atau tamat tempoh",
  },
  "login.sendError": {
    en: "Failed to send code. Try again.",
    zh: "发送失败，请重试",
    zhTw: "發送失敗，請重試",
    ms: "Gagal hantar kod. Cuba lagi.",
  },
  /* ─── Payment ─── */
  "pay.chooseMethod": {
    en: "Choose Payment Method",
    zh: "选择支付方式",
    zhTw: "選擇支付方式",
    ms: "Pilih Kaedah Pembayaran",
  },
  "pay.wechat": {
    en: "WeChat Pay",
    zh: "微信支付",
    zhTw: "微信支付",
    ms: "WeChat Pay",
  },
  "pay.alipay": { en: "Alipay", zh: "支付宝", zhTw: "支付寶", ms: "Alipay" },
  "pay.stripe": {
    en: "Pay by Card (Stripe)",
    zh: "银行卡支付 (Stripe)",
    zhTw: "銀行卡支付 (Stripe)",
    ms: "Bayar dengan Kad (Stripe)",
  },
  "pay.comingSoon": {
    en: "Coming soon — not yet configured",
    zh: "即将开放，尚未配置",
    zhTw: "即將開放，尚未配置",
    ms: "Akan datang — belum dikonfigurasi",
  },
  "pay.scanQr": {
    en: "Scan QR code to pay",
    zh: "扫码支付",
    zhTw: "掃碼支付",
    ms: "Imbas kod QR untuk bayar",
  },
  "pay.amount": { en: "Amount", zh: "金额", zhTw: "金額", ms: "Jumlah" },
  "pay.waitingPayment": {
    en: "Waiting for payment…",
    zh: "等待支付…",
    zhTw: "等待支付…",
    ms: "Menunggu pembayaran…",
  },
  "pay.paid": {
    en: "Payment received!",
    zh: "支付成功！",
    zhTw: "支付成功！",
    ms: "Pembayaran diterima!",
  },
  "pay.failed": {
    en: "Payment failed. Please try again.",
    zh: "支付失败，请重试",
    zhTw: "支付失敗，請重試",
    ms: "Pembayaran gagal. Cuba lagi.",
  },
  "pay.openingStripe": {
    en: "Opening Stripe checkout…",
    zh: "正在跳转至 Stripe…",
    zhTw: "正在跳轉至 Stripe…",
    ms: "Membuka Stripe checkout…",
  },

  "login.email": {
    en: "Email / Social",
    zh: "邮箱 / 社交账号",
    zhTw: "郵箱 / 社交帳號",
    ms: "E-mel / Sosial",
  },
  "login.emailDesc": {
    en: "Sign in with Google, Facebook, Apple, Microsoft or email",
    zh: "使用 Google、Facebook、Apple、微软或邮箱登录",
    zhTw: "使用 Google、Facebook、Apple、微軟或郵箱登入",
    ms: "Log masuk dengan Google, Facebook, Apple, Microsoft atau e-mel",
  },
  "login.emailBtn": {
    en: "Continue with Email / Social",
    zh: "邮箱 / 社交账号登录",
    zhTw: "郵箱 / 社交帳號登入",
    ms: "Teruskan dengan E-mel / Sosial",
  },

  /* ─── Footer ─── */
  "footer.about": {
    en: "About Us",
    zh: "关于我们",
    zhTw: "關於我們",
    ms: "Tentang Kami",
  },
  "footer.contact": {
    en: "Contact",
    zh: "联系我们",
    zhTw: "聯繫我們",
    ms: "Hubungi Kami",
  },
  "footer.terms": {
    en: "Terms of Service",
    zh: "服务条款",
    zhTw: "服務條款",
    ms: "Syarat Perkhidmatan",
  },
  "footer.privacy": {
    en: "Privacy Policy",
    zh: "隐私政策",
    zhTw: "隱私政策",
    ms: "Dasar Privasi",
  },
  "footer.rights": {
    en: "All rights reserved.",
    zh: "保留所有权利。",
    zhTw: "保留所有權利。",
    ms: "Hak cipta terpelihara.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  return entry?.[locale] ?? entry?.en ?? key;
}

/** Get localized product field based on locale suffix */
export function localizedField<T extends Record<string, any>>(
  item: T,
  base: string,
  locale: Locale
): string {
  const suffixMap: Record<Locale, string> = {
    en: "En",
    zh: "Zh",
    zhTw: "ZhTw",
    ms: "Ms",
  };
  const key = `${base}${suffixMap[locale]}`;
  return (item[key] as string) ?? (item[`${base}En`] as string) ?? "";
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("locale") as Locale) || "zh";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem("locale", locale);
}
