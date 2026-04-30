import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const categorySeed = [
  {
    slug: "metal-hardware",
    nameEn: "Metal Hardware",
    nameZh: "金属五金",
    nameZhTw: "金屬五金",
    nameMs: "Perkakasan Logam",
    descEn: "Premium metal hardware for industrial and commercial applications",
    descZh: "适用于工业和商业应用的优质金属五金",
    descZhTw: "適用於工業和商業應用的優質金屬五金",
    descMs: "Perkakasan logam premium untuk aplikasi industri dan komersial",
    sortOrder: 1,
  },
  {
    slug: "bearings",
    nameEn: "Bearings",
    nameZh: "轴承",
    nameZhTw: "軸承",
    nameMs: "Galas",
    descEn: "High-precision bearings for machinery and equipment",
    descZh: "适用于机械和设备的高精度轴承",
    descZhTw: "適用於機械和設備的高精度軸承",
    descMs: "Galas berketepatan tinggi untuk jentera dan peralatan",
    sortOrder: 2,
  },
  {
    slug: "electromechanical",
    nameEn: "Electromechanical",
    nameZh: "机电元件",
    nameZhTw: "機電元件",
    nameMs: "Elektromekanikal",
    descEn: "Reliable electromechanical components for automation and control",
    descZh: "适用于自动化和控制的可靠机电元件",
    descZhTw: "適用於自動化和控制的可靠機電元件",
    descMs:
      "Komponen elektromekanikal yang boleh dipercayai untuk automasi dan kawalan",
    sortOrder: 3,
  },
  {
    slug: "screws",
    nameEn: "Screws & Fasteners",
    nameZh: "螺丝和紧固件",
    nameZhTw: "螺絲和緊固件",
    nameMs: "Skru & Pengikat",
    descEn: "Industrial-grade screws and fasteners for every application",
    descZh: "适用于各种应用的工业级螺丝和紧固件",
    descZhTw: "適用於各種應用的工業級螺絲和緊固件",
    descMs: "Skru dan pengikat gred industri untuk setiap aplikasi",
    sortOrder: 4,
  },
  {
    slug: "daily-supplies",
    nameEn: "Daily Supplies",
    nameZh: "日常用品",
    nameZhTw: "日常用品",
    nameMs: "Bekalan Harian",
    descEn: "Everyday household and utility products for home and office use",
    descZh: "适用于家庭和办公室的日常生活用品",
    descZhTw: "適用於家庭和辦公室的日常生活用品",
    descMs: "Produk keperluan harian untuk kegunaan rumah dan pejabat",
    sortOrder: 5,
  },
];

const productSeed = [
  {
    sku: "MH-001",
    categoryId: 1,
    nameEn: "Stainless Steel Bracket L-Shape",
    nameZh: "不锈钢L型支架",
    nameZhTw: "不鏽鋼L型支架",
    nameMs: "Pendakap L Keluli Tahan Karat",
    descEn:
      "Heavy-duty stainless steel L-bracket for structural mounting. Corrosion-resistant 304 grade steel.",
    descZh: "重型不锈钢L型支架，用于结构安装。耐腐蚀304级钢材。",
    descZhTw: "重型不鏽鋼L型支架，用於結構安裝。耐腐蝕304級鋼材。",
    descMs:
      "Pendakap L keluli tahan karat tugas berat untuk pemasangan struktur.",
    specs: {
      Material: "304 Stainless Steel",
      Size: "100x80x30mm",
      Thickness: "3mm",
      Finish: "Brushed",
    },
    price: "12.50",
    stock: 500,
    images: ["https://productstupian.zhenda.store"],
  },
  {
    sku: "MH-002",
    categoryId: 1,
    nameEn: "Aluminum Flat Bar 6061-T6",
    nameZh: "6061-T6铝合金扁条",
    nameZhTw: "6061-T6鋁合金扁條",
    nameMs: "Bar Rata Aluminium 6061-T6",
    descEn:
      "Precision-cut aluminum flat bar for fabrication and structural use.",
    descZh: "精密切割铝合金扁条，用于制造和结构用途。",
    descZhTw: "精密切割鋁合金扁條，用於製造和結構用途。",
    descMs:
      "Bar rata aluminium potong tepat untuk fabrikasi dan kegunaan struktur.",
    specs: {
      Material: "6061-T6 Aluminum",
      Length: "1000mm",
      Width: "50mm",
      Thickness: "6mm",
    },
    price: "18.75",
    stock: 300,
    images: ["https://productstupian.zhenda.store"],
  },
  {
    sku: "MH-003",
    categoryId: 1,
    nameEn: "Carbon Steel Hinge Heavy Duty",
    nameZh: "碳钢重型铰链",
    nameZhTw: "碳鋼重型鉸鏈",
    nameMs: "Engsel Tugas Berat Keluli Karbon",
    descEn: "Industrial carbon steel hinge for gates and heavy doors.",
    descZh: "工业碳钢铰链，适用于大门和重型门。",
    descZhTw: "工業碳鋼鉸鏈，適用於大門和重型門。",
    descMs: "Engsel keluli karbon industri untuk pintu pagar dan pintu berat.",
    specs: {
      Material: "Carbon Steel",
      Size: "150x100mm",
      Load: "200kg",
      Finish: "Zinc Plated",
    },
    price: "8.90",
    stock: 800,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "MH-004",
    categoryId: 1,
    nameEn: 'Brass Coupling Fitting 1/2"',
    nameZh: '黄铜耦合接头 1/2"',
    nameZhTw: '黃銅耦合接頭 1/2"',
    nameMs: 'Penyambung Gandingan Loyang 1/2"',
    descEn:
      "Precision machined brass coupling for plumbing and pneumatic systems.",
    descZh: "精密加工黄铜耦合件，用于管道和气动系统。",
    descZhTw: "精密加工黃銅耦合件，用於管道和氣動系統。",
    descMs: "Gandingan loyang mesin tepat untuk sistem paip dan pneumatik.",
    specs: {
      Material: "Brass C36000",
      Thread: '1/2" NPT',
      Pressure: "300 PSI",
      Finish: "Natural",
    },
    price: "6.40",
    stock: 1200,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "MH-005",
    categoryId: 1,
    nameEn: "Shanshi Heavy-Duty 8-inch White Nylon Swivel Caster",
    nameZh: "山狮加重白尼龙脚轮8寸（活动）",
    nameZhTw: "山獅加重白尼龍腳輪8寸（活動）",
    nameMs: "Roda Putar Nilon Putih Shanshi 8 Inci (Boleh Pusing)",
    descEn:
      "Suitable for clean rooms in pharmaceutical factories, large warehouse shelf trolleys, and work carts requiring frequent directional changes. Use in combination with fixed casters to achieve full omni-directional steering for hand trolleys.",
    descZh:
      "适用于在制药厂洁净车间、大型仓储货架及需要频繁转向搬运的工作台车底部，搭配固定脚轮使用，实现手推车灵活的全方位转向操控。",
    descZhTw:
      "適用於製藥廠潔淨車間、大型倉儲貨架及需要頻繁轉向搬運的工作台車底部，搭配固定腳輪使用，實現手推車靈活的全方位轉向操控。",
    descMs:
      "Sesuai untuk bilik bersih kilang farmaseutikal, rak stor gudang besar, dan troli kerja yang memerlukan penukaran arah kerap. Gunakan bersama roda tetap untuk kawalan pemanduan omni-arah yang fleksibel.",
    specs: {
      BracketThickness: "6mm",
      LoadCapacity: "450kg",
      Weight: "2.59kg",
      Type: "Swivel Caster",
    },
    price: "26.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/MH/1.png"],
  },
  {
    sku: "MH-006",
    categoryId: 1,
    nameEn: "Shanshi Heavy-Duty 8-inch White Nylon Fixed Caster",
    nameZh: "山狮加重白尼龙脚轮8寸（固定）",
    nameZhTw: "山獅加重白尼龍腳輪8寸（固定）",
    nameMs: "Roda Tetap Nilon Putih Shanshi 8 Inci (Tetap)",
    descEn:
      "Suitable for the front end of logistics sorting line conveyor trolleys or the base of large supermarket shelves. Paired with swivel casters for straight-line stability, preventing trolley deviation and skidding.",
    descZh:
      "适用于物流分拣线的传送台车前端或大型超市货架底部，配合活动脚轮提供直线前进保障，解决推车跑偏打滑的问题。",
    descZhTw:
      "適用於物流分揀線的傳送台車前端或大型超市貨架底部，配合活動腳輪提供直線前進保障，解決推車跑偏打滑的問題。",
    descMs:
      "Sesuai untuk bahagian hadapan troli conveyor talian pemilihan logistik atau tapak rak pasar raya besar. Digabungkan dengan roda boleh putar untuk kestabilan pergerakan lurus, mencegah troli menyimpang dan tergelincir.",
    specs: {
      BracketThickness: "6mm",
      LoadCapacity: "450kg",
      Weight: "2.16kg",
      Type: "Fixed Caster",
    },
    price: "24.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/MH/2.png"],
  },
  {
    sku: "MH-007",
    categoryId: 1,
    nameEn: "Shanshi Heavy-Duty 8-inch White Nylon Brake Caster",
    nameZh: "山狮加重白尼龙脚轮8寸（刹车）",
    nameZhTw: "山獅加重白尼龍腳輪8寸（剎車）",
    nameMs: "Roda Brek Nilon Putih Shanshi 8 Inci (Brek)",
    descEn:
      "Suitable for mobile equipment racks in welding workshops and food processing kitchen trolleys. The single-step dual-brake design simultaneously locks both rolling and swiveling, preventing equipment with hydraulic devices from rolling down slopes and causing safety accidents.",
    descZh:
      "适用于焊接车间移动设备架及厨房食品加工推车，一脚双刹设计可同时锁死滚动和转向，防止带液压装置的设备溜坡引发安全事故。",
    descZhTw:
      "適用於焊接車間移動設備架及廚房食品加工推車，一腳雙剎設計可同時鎖死滾動和轉向，防止帶液壓裝置的設備溜坡引發安全事故。",
    descMs:
      "Sesuai untuk rak peralatan mudah alih di bengkel kimpalan dan troli pemprosesan makanan dapur. Rekaan brek dua-dalam-satu mengunci gelundur dan putaran serentak, mencegah peralatan hidraulik bergerak di cerun dan menyebabkan kemalangan.",
    specs: {
      BracketThickness: "6mm",
      LoadCapacity: "450kg",
      Weight: "3kg",
      Type: "Brake Caster",
    },
    price: "34.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/MH/3.png"],
  },
  {
    sku: "MH-008",
    categoryId: 1,
    nameEn: "Shanshi Heavy-Duty White Nylon Single Caster Wheel",
    nameZh: "山狮重型白尼龙脚轮（单轮）",
    nameZhTw: "山獅重型白尼龍腳輪（單輪）",
    nameMs: "Roda Nilon Putih Berat Shanshi (Roda Tunggal)",
    descEn:
      "Suitable for replacing damaged wheels on hand trucks or custom mobile chassis. Acid and alkali resistant material withstands grease corrosion; will not deform or stick during long-term use in damp or chemical environments.",
    descZh:
      "适用于替换损坏的搬运小坦克轮或订制化移动底盘，耐酸碱材质不怕油脂腐蚀，长期在潮湿或化学环境中不发生形变粘连。",
    descZhTw:
      "適用於替換損壞的搬運小坦克輪或訂製化移動底盤，耐酸鹼材質不怕油脂腐蝕，長期在潮濕或化學環境中不發生形變粘連。",
    descMs:
      "Sesuai untuk menggantikan roda troli angkut yang rosak atau casis mudah alih tersuai. Bahan tahan asid dan alkali tidak terpengaruh oleh kakisan gris; tidak berubah bentuk atau melekat dalam persekitaran lembap atau kimia jangka panjang.",
    specs: {
      LoadCapacity: "200kg",
      Material: "White Nylon",
      Type: "Single Wheel",
    },
    price: "11.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/MH/4.png"],
  },
  {
    sku: "MH-009",
    categoryId: 1,
    nameEn: "Jintian Woodworking Alloy Saw Blade 355mm×3.2mm 100T Bore 30mm",
    nameZh: "金田装修级合金锯片355*3.2*100T*30木用交替齿",
    nameZhTw: "金田裝修級合金鋸片355*3.2*100T*30木用交替齒",
    nameMs:
      "Bilah Gergaji Aloi Pertukangan Jintian 355mm×3.2mm 100T Lubang 30mm",
    descEn:
      "Suitable for precision cutting of solid wood door frames, plywood, and high-density lacquer-free boards on construction site push saws. The 100-tooth fine edge effectively eliminates board edge chipping, ensuring smooth cross-section cuts that require no secondary edge banding.",
    descZh:
      "适用于工地推台锯精准下料裁切实木门框、胶合板及高密度免漆板，100齿细锯齿有效杜绝板材边缘崩茬，确保横切面光滑无需二次封边。",
    descZhTw:
      "適用於工地推台鋸精準下料裁切實木門框、膠合板及高密度免漆板，100齒細鋸齒有效杜絕板材邊緣崩茬，確保橫切面光滑無需二次封邊。",
    descMs:
      "Sesuai untuk pemotongan tepat bingkai pintu kayu pejal, papan lapis, dan papan densiti tinggi tanpa cat pada gergaji tolak tapak bina. 100 gigi halus mencegah pecah tepi papan, memastikan keratan rentas licin tanpa pita tepi sekunder.",
    specs: {
      Diameter: "355mm",
      Thickness: "3.2mm",
      Teeth: "100T",
      Bore: "30mm",
      ToothType: "Alternate",
    },
    price: "170.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/MH/5.png"],
  },
  {
    sku: "MH-010",
    categoryId: 1,
    nameEn: "Jiteng Meiying 580 Ceramic Cutting Disc 105×20×10×1.1mm",
    nameZh: "冀腾魅影580陶瓷切割片105*20*10*1.1mm",
    nameZhTw: "冀騰魅影580陶瓷切割片105*20*10*1.1mm",
    nameMs: "Cakera Pemotong Seramik Jiteng Meiying 580 105×20×10×1.1mm",
    descEn:
      "Suitable for fast cutting of fully vitrified tiles and polished porcelain with an angle grinder. The 1.1mm ultra-thin base fits narrow gap operations on renovation sites, reducing body cracking while solving the problem of glaze chipping and costly rework.",
    descZh:
      "适用于云石机快速切割全瓷砖抛光砖，1.1mm超薄基体适配装修现场狭小缝隙作业，减少对坯体的震裂同时解决崩釉返工翻车问题。",
    descZhTw:
      "適用於雲石機快速切割全瓷磚拋光磚，1.1mm超薄基體適配裝修現場狹小縫隙作業，減少對坯體的震裂同時解決崩釉返工翻車問題。",
    descMs:
      "Sesuai untuk pemotongan cepat jubin porselin kilauan penuh dengan pengisar sudut. Asas ultra nipis 1.1mm sesuai untuk operasi celahan sempit di tapak pengubahsuaian, mengurangkan retak pada badan jubin dan menyelesaikan masalah pecah glazur.",
    specs: {
      Diameter: "105mm",
      Bore: "20mm",
      Height: "10mm",
      Thickness: "1.1mm",
      Type: "Ceramic Cutting Disc",
    },
    price: "10.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/MH/8.png"],
  },
  {
    sku: "MH-011",
    categoryId: 1,
    nameEn: "Jiteng Industrial Chamfer Cutting Disc 116×20×10×1.6mm",
    nameZh: "冀腾工业级倒角专用切割片116*20*10*1.6mm",
    nameZhTw: "冀騰工業級倒角專用切割片116*20*10*1.6mm",
    nameMs: "Cakera Pemotong Chamfer Industri Jiteng 116×20×10×1.6mm",
    descEn:
      "Designed for professional tile chamfering machines to cut 45° bevelled edges on floor tiles and marble corners. The 1.6mm thickness ensures clean straight cuts on vitrified tiles without chipping, eliminating dust-trapping dead corners when laying marble.",
    descZh:
      "适用于专业瓷砖美缝倒角机，专切地砖阳角海棠角45°斜面尖角，1.6mm厚度保障玻化砖切口平整笔直不崩缺，杜绝粘贴大理石时的积灰滞留死角。",
    descZhTw:
      "適用於專業瓷磚美縫倒角機，專切地磚陽角海棠角45°斜面尖角，1.6mm厚度保障玻化磚切口平整筆直不崩缺，杜絕粘貼大理石時的積灰滯留死角。",
    descMs:
      "Direka untuk mesin chamfer jubin profesional bagi memotong tepi bevel 45° pada jubin lantai dan sudut marmar. Ketebalan 1.6mm memastikan potongan bersih dan lurus tanpa pecah pada jubin vitrifikasi, menghapuskan sudut mati pengumpulan habuk semasa pemasangan marmar.",
    specs: {
      Diameter: "116mm",
      Bore: "20mm",
      Height: "10mm",
      Thickness: "1.6mm",
      Type: "Chamfer Cutting Disc",
    },
    price: "17.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/MH/9.png"],
  },
  {
    sku: "MH-012",
    categoryId: 1,
    nameEn: "Mingwei Zinc Alloy Female Thread Tee Fitting SMY 1/4-inch",
    nameZh: "明威锌合金接头内丝三通 SMY-1/4寸",
    nameZhTw: "明威鋅合金接頭內絲三通 SMY-1/4寸",
    nameMs: "Penyambung Tiga Hala Benang Dalam Aloi Zink Mingwei SMY 1/4 Inci",
    descEn:
      "Suitable for branching household water purifier soft hose lines, aquarium wave pump filtration systems, and compressed air pipe networks. Zinc alloy anti-corrosion properties prevent the rust and blockage issues of traditional iron tee fittings in damp under-sink cabinets.",
    descZh:
      "适用于全屋净水软管分接分支管路、鱼缸造浪底滤系统分流或压缩空气气管路汇接，锌合金防腐蚀特性避免传统铁三通在潮湿橱柜下生锈堵塞风险。",
    descZhTw:
      "適用於全屋淨水軟管分接分支管路、魚缸造浪底濾系統分流或壓縮空氣氣管路匯接，鋅合金防腐蝕特性避免傳統鐵三通在潮濕櫥櫃下生鏽堵塞風險。",
    descMs:
      "Sesuai untuk percabangan hos lembut penapis air rumah, sistem penapis kolam ikan, dan rangkaian paip udara termampat. Sifat anti-karat aloi zink mengelakkan masalah karat dan tersumbat pada fitting besi tradisional dalam kabinet bawah sinki yang lembap.",
    specs: {
      Size: '1/4"',
      Material: "Zinc Alloy",
      Connection: "Female Thread",
      Type: "Tee Fitting",
    },
    price: "12.00",
    stock: 800,
    images: ["https://productstupian.zhenda.store/uploads/MH/10.png"],
  },
  {
    sku: "MH-013",
    categoryId: 1,
    nameEn: "Tianzhangtian Square Shank Electric Hammer Drill Bit 28×350mm",
    nameZh: "天中天方柄电锤钻头28*350mm",
    nameZhTw: "天中天方柄電錘鑽頭28*350mm",
    nameMs:
      "Mata Gerudi Tukul Elektrik Batang Segi Empat Tianzhangtian 28×350mm",
    descEn:
      "Suitable for installing expansion bolts for wall-mounted water heaters or drilling large 4-inch and above fresh air duct openings. The 40Cr alloy extra-long drill body can penetrate reinforced concrete load-bearing beams over 30cm thick, resolving the safety hazard of anchors failing to seat properly.",
    descZh:
      "适用于安装大型穿墙热水器膨胀螺栓或4寸及以上超大新风管道开孔，40Cr钢材合金超长钻身可直接穿透厚度超30cm的钢筋混凝土承重梁，解决墙体无法穿透导致锚栓虚挂的安全隐患。",
    descZhTw:
      "適用於安裝大型穿牆熱水器膨脹螺栓或4寸及以上超大新風管道開孔，40Cr鋼材合金超長鑽身可直接穿透厚度超30cm的鋼筋混凝土承重梁，解決牆體無法穿透導致錨栓虛掛的安全隱患。",
    descMs:
      "Sesuai untuk memasang bolt pengembang pemanas air dinding besar atau menggerudi bukaan saluran udara baharu berdiameter 4 inci ke atas. Badan gerudi panjang aloi keluli 40Cr boleh menembusi rasuk konkrit bertetulang berketebalan lebih 30cm, menyelesaikan bahaya keselamatan angkur tergantung.",
    specs: {
      Diameter: "28mm",
      Length: "350mm",
      Material: "40Cr Steel",
      Type: "Electric Hammer Drill Bit",
    },
    price: "54.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/MH/11.png"],
  },
  {
    sku: "MH-014",
    categoryId: 1,
    nameEn: "Qianli Fiber Reinforced Resin Cutting Wheel 125×1.2×22mm",
    nameZh: "千里马纤维增强树脂切割砂轮125*1.2*22",
    nameZhTw: "千里馬纖維增強樹脂切割砂輪125*1.2*22",
    nameMs: "Roda Pemotong Resin Bertetulang Gentian Qianli 125×1.2×22mm",
    descEn:
      "Suitable for cutting old galvanized pipes, thin-wall stainless steel pipes, and rusted expansion bolts with an angle grinder. The internal fiberglass mesh prevents disc breakage during cutting, making it easy to cut short nails and detach scrapped parts quickly.",
    descZh:
      "适用于角磨机切割老旧镀锌水管、薄壁不锈钢管及生锈膨胀螺栓，内部嵌入玻璃纤维网防止切割时爆裂，轻松切断铁钉短料实现报废件快速剥离。",
    descZhTw:
      "適用於角磨機切割老舊鍍鋅水管、薄壁不鏽鋼管及生鏽膨脹螺栓，內部嵌入玻璃纖維網防止切割時爆裂，輕鬆切斷鐵釘短料實現報廢件快速剝離。",
    descMs:
      "Sesuai untuk memotong paip galvanis lama, paip keluli tahan karat berdinding nipis, dan bolt pengembang berkarat dengan pengisar sudut. Rangkaian gentian kaca dalaman mencegah cakera pecah semasa pemotongan, memudahkan pemotongan paku pendek dan penanggalan bahagian terpakai.",
    specs: {
      Diameter: "125mm",
      Thickness: "1.2mm",
      Bore: "22mm",
      Reinforcement: "Fiberglass Mesh",
      Type: "Cutting Wheel",
    },
    price: "1.30",
    stock: 2000,
    images: ["https://productstupian.zhenda.store/uploads/MH/12.png"],
  },
  {
    sku: "MH-015",
    categoryId: 1,
    nameEn: "Lantian Panasonic-Type Welding Nozzle P200 Brass 18×1.2mm",
    nameZh: "蓝天松下型喷嘴P200黄铜喷嘴18*1.2",
    nameZhTw: "藍天松下型噴嘴P200黃銅噴嘴18*1.2",
    nameMs: "Muncung Kimpalan Jenis Panasonic Lantian P200 Loyang 18×1.2mm",
    descEn:
      "Brass welding nozzle compatible with Panasonic-type MIG/MAG welding torches. Model P200, 18mm length with 1.2mm bore. Durable brass construction for stable arc and reduced spatter.",
    descZh:
      "兼容松下型MIG/MAG焊枪的黄铜导电嘴，型号P200，长18mm，内径1.2mm，黄铜材质耐用，弧稳飞溅少。",
    descZhTw:
      "兼容松下型MIG/MAG焊槍的黃銅導電嘴，型號P200，長18mm，內徑1.2mm，黃銅材質耐用，弧穩飛濺少。",
    descMs:
      "Muncung kimpalan loyang serasi dengan obor kimpalan MIG/MAG jenis Panasonic. Model P200, panjang 18mm dengan lubang 1.2mm. Binaan loyang tahan lama untuk arka stabil dan percikan berkurangan.",
    specs: {
      Material: "Brass",
      Model: "P200",
      Length: "18mm",
      Bore: "1.2mm",
      Type: "Welding Contact Tip",
    },
    price: "7.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/MH/6.png"],
  },
  {
    sku: "MH-016",
    categoryId: 1,
    nameEn: "Lantian Insulator P-350 (Gum Type)",
    nameZh: "蓝天绝缘体P-350（加姆）",
    nameZhTw: "藍天絕緣體P-350（加姆）",
    nameMs: "Penebat Lantian P-350 (Jenis Gum)",
    descEn:
      "Insulator for P-350 welding torch, gum type. Provides electrical insulation between the contact tip and nozzle assembly, preventing short circuits and extending torch service life.",
    descZh:
      "适用于P-350焊枪的加姆型绝缘体，在导电嘴与喷嘴组件之间提供电气绝缘，防止短路并延长焊枪使用寿命。",
    descZhTw:
      "適用於P-350焊槍的加姆型絕緣體，在導電嘴與噴嘴組件之間提供電氣絕緣，防止短路並延長焊槍使用壽命。",
    descMs:
      "Penebat jenis gum untuk obor kimpalan P-350. Menyediakan penebatan elektrik antara hujung sentuhan dan pemasangan muncung, mencegah litar pintas dan melanjutkan jangka hayat obor.",
    specs: {
      Model: "P-350",
      Type: "Gum Insulator",
      Application: "MIG/MAG Welding Torch",
    },
    price: "2.30",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/MH/7.png"],
  },
  {
    sku: "BR-001",
    categoryId: 2,
    nameEn: "Deep Groove Ball Bearing 6205-2RS",
    nameZh: "深沟球轴承 6205-2RS",
    nameZhTw: "深溝球軸承 6205-2RS",
    nameMs: "Galas Bola Alur Dalam 6205-2RS",
    descEn:
      "Premium sealed deep groove ball bearing for general industrial use.",
    descZh: "优质密封深沟球轴承，适用于一般工业用途。",
    descZhTw: "優質密封深溝球軸承，適用於一般工業用途。",
    descMs:
      "Galas bola alur dalam bertutup premium untuk kegunaan industri am.",
    specs: {
      Type: "Deep Groove Ball",
      Bore: "25mm",
      OD: "52mm",
      Width: "15mm",
      Speed: "12000 RPM",
    },
    price: "14.20",
    stock: 600,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "BR-002",
    categoryId: 2,
    nameEn: "Tapered Roller Bearing 30205",
    nameZh: "圆锥滚子轴承 30205",
    nameZhTw: "圓錐滾子軸承 30205",
    nameMs: "Galas Penggelek Tirus 30205",
    descEn:
      "High-capacity tapered roller bearing for heavy radial and axial loads.",
    descZh: "大容量圆锥滚子轴承，适用于重型径向和轴向载荷。",
    descZhTw: "大容量圓錐滾子軸承，適用於重型徑向和軸向載荷。",
    descMs:
      "Galas penggelek tirus berkapasiti tinggi untuk beban jejari dan paksi berat.",
    specs: {
      Type: "Tapered Roller",
      Bore: "25mm",
      OD: "52mm",
      Width: "16.25mm",
      Load: "34.1 kN",
    },
    price: "22.80",
    stock: 400,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "BR-003",
    categoryId: 2,
    nameEn: "Needle Roller Bearing NK20/16",
    nameZh: "滚针轴承 NK20/16",
    nameZhTw: "滾針軸承 NK20/16",
    nameMs: "Galas Penggelek Jarum NK20/16",
    descEn: "Compact needle roller bearing for space-constrained applications.",
    descZh: "紧凑型滚针轴承，适用于空间受限的应用。",
    descZhTw: "緊湊型滾針軸承，適用於空間受限的應用。",
    descMs: "Galas penggelek jarum padat untuk aplikasi ruang terhad.",
    specs: {
      Type: "Needle Roller",
      Bore: "20mm",
      OD: "28mm",
      Width: "16mm",
      Load: "14.6 kN",
    },
    price: "9.50",
    stock: 750,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "BR-004",
    categoryId: 2,
    nameEn: "Pillow Block Bearing UCP205",
    nameZh: "带座轴承 UCP205",
    nameZhTw: "帶座軸承 UCP205",
    nameMs: "Galas Blok Bantal UCP205",
    descEn: "Self-aligning pillow block bearing unit for shaft support.",
    descZh: "自调心带座轴承单元，用于轴支撑。",
    descZhTw: "自調心帶座軸承單元，用於軸支撐。",
    descMs: "Unit galas blok bantal penjajaran sendiri untuk sokongan aci.",
    specs: {
      Type: "Pillow Block",
      Bore: "25mm",
      Housing: "Cast Iron",
      Seal: "Double Lip",
      Load: "14.0 kN",
    },
    price: "28.90",
    stock: 350,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "EM-001",
    categoryId: 3,
    nameEn: "NEMA 23 Stepper Motor",
    nameZh: "NEMA 23步进电机",
    nameZhTw: "NEMA 23步進電機",
    nameMs: "Motor Stepper NEMA 23",
    descEn: "High-torque bipolar stepper motor for CNC and automation.",
    descZh: "高扭矩双极步进电机，适用于CNC和自动化。",
    descZhTw: "高扭矩雙極步進電機，適用於CNC和自動化。",
    descMs: "Motor stepper dwikutub tork tinggi untuk CNC dan automasi.",
    specs: {
      Type: "Bipolar Stepper",
      Torque: "1.26 Nm",
      Current: "2.8A",
      Steps: "200/rev",
      Frame: "NEMA 23",
    },
    price: "35.00",
    stock: 200,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "EM-002",
    categoryId: 3,
    nameEn: "24V DC Solenoid Valve",
    nameZh: "24V直流电磁阀",
    nameZhTw: "24V直流電磁閥",
    nameMs: "Injap Solenoid DC 24V",
    descEn: "Normally closed solenoid valve for fluid control systems.",
    descZh: "常闭电磁阀，用于流体控制系统。",
    descZhTw: "常閉電磁閥，用於流體控制系統。",
    descMs: "Injap solenoid tertutup biasa untuk sistem kawalan bendalir.",
    specs: {
      Voltage: "24V DC",
      Port: '1/4" NPT',
      Pressure: "0-150 PSI",
      Media: "Air/Water/Oil",
    },
    price: "19.90",
    stock: 450,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "EM-003",
    categoryId: 3,
    nameEn: "Industrial Relay 12V 30A",
    nameZh: "工业继电器 12V 30A",
    nameZhTw: "工業繼電器 12V 30A",
    nameMs: "Geganti Industri 12V 30A",
    descEn: "Heavy-duty automotive and industrial relay with SPDT contacts.",
    descZh: "重型汽车和工业继电器，带SPDT触点。",
    descZhTw: "重型汽車和工業繼電器，帶SPDT觸點。",
    descMs: "Geganti automotif dan industri tugas berat dengan kenalan SPDT.",
    specs: {
      Coil: "12V DC",
      Contact: "SPDT 30A",
      Life: "100,000 cycles",
      Mount: "PCB/Panel",
    },
    price: "4.50",
    stock: 2000,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "EM-004",
    categoryId: 3,
    nameEn: "Linear Actuator 12V 100mm",
    nameZh: "线性执行器 12V 100mm",
    nameZhTw: "線性執行器 12V 100mm",
    nameMs: "Penggerak Linear 12V 100mm",
    descEn: "Electric linear actuator with built-in limit switches.",
    descZh: "带内置限位开关的电动线性执行器。",
    descZhTw: "帶內置限位開關的電動線性執行器。",
    descMs: "Penggerak linear elektrik dengan suis had terbina dalam.",
    specs: {
      Voltage: "12V DC",
      Stroke: "100mm",
      Force: "750N",
      Speed: "10mm/s",
    },
    price: "42.00",
    stock: 180,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "EM-005",
    categoryId: 3,
    nameEn: "Haitu Jinlong Portable Concrete Vibrator B Type 220V",
    nameZh: "海途金龙手提振动器B款/220V",
    nameZhTw: "海途金龍手提振動器B款/220V",
    nameMs: "Penggetar Konkrit Mudah Alih Haitu Jinlong Jenis B 220V",
    descEn:
      "Used when pouring concrete floors and columns to expel air bubbles and make the concrete denser. Simply plug into standard household power, insert the vibrating rod into the wet concrete and shake for a few minutes. 220V matches standard household voltage.",
    descZh:
      "用在浇筑水泥地、柱子时排出气泡让水泥更结实；插上普通家用电，把振动棒插进湿水泥里晃几分钟即可；220V就是家用电电压。",
    descZhTw:
      "用在澆築水泥地、柱子時排出氣泡讓水泥更結實；插上普通家用電，把振動棒插進濕水泥裡晃幾分鐘即可；220V就是家用電電壓。",
    descMs:
      "Digunakan semasa menuang lantai dan tiang konkrit untuk mengeluarkan gelembung udara bagi menjadikan konkrit lebih padat. Hanya sambungkan ke bekalan elektrik rumah biasa, masukkan rod getaran ke dalam konkrit basah dan goncang beberapa minit. 220V sepadan dengan voltan elektrik rumah.",
    specs: { Voltage: "220V", Type: "Portable Vibrator", Model: "B" },
    price: "95.00",
    stock: 100,
    images: ["https://productstupian.zhenda.store/uploads/EM/1.png"],
  },
  {
    sku: "EM-006",
    categoryId: 3,
    nameEn: "Haitu Jinlong Portable Concrete Vibrator 1200W 220V",
    nameZh: "海途金龙手提振动器1200W/220V",
    nameZhTw: "海途金龍手提振動器1200W/220V",
    nameMs: "Penggetar Konkrit Mudah Alih Haitu Jinlong 1200W 220V",
    descEn:
      "Expels air bubbles when pouring concrete to make it denser; suitable for thicker concrete members such as beams and walls. Plug into standard household power, insert the vibrating rod into the wet concrete and shake for a few minutes. 1200W indicates power consumption; 220V is household voltage.",
    descZh:
      "用在浇筑水泥地、柱子时排出气泡让水泥更结实，适合梁、墙等较厚的水泥构件；插上普通家用电，把振动棒插进湿水泥里晃几分钟即可；1200W代表耗电，220V就是家用电电压。",
    descZhTw:
      "用在澆築水泥地、柱子時排出氣泡讓水泥更結實，適合梁、牆等較厚的水泥構件；插上普通家用電，把振動棒插進濕水泥裡晃幾分鐘即可；1200W代表耗電，220V就是家用電電壓。",
    descMs:
      "Mengeluarkan gelembung udara semasa menuang konkrit untuk menjadikannya lebih padat; sesuai untuk anggota konkrit yang lebih tebal seperti rasuk dan dinding. Sambungkan ke bekalan elektrik rumah, masukkan rod getaran ke dalam konkrit basah dan goncang beberapa minit. 1200W menunjukkan penggunaan kuasa; 220V adalah voltan rumah.",
    specs: { Power: "1200W", Voltage: "220V", Type: "Portable Vibrator" },
    price: "130.00",
    stock: 100,
    images: ["https://productstupian.zhenda.store/uploads/EM/2.png"],
  },
  {
    sku: "EM-007",
    categoryId: 3,
    nameEn: "Xinhaitu Immersion Concrete Vibrator 3.0kW 380V (Round Pin)",
    nameZh: "鑫海途插入式振动器3.0kW/380V（圆孔）",
    nameZhTw: "鑫海途插入式振動器3.0kW/380V（圓孔）",
    nameMs: "Penggetar Konkrit Celupan Xinhaitu 3.0kW 380V (Pin Bulat)",
    descEn:
      "For large-volume concrete pours on construction sites such as bridge piers and factory floors. Requires a 380V three-phase industrial power connection; insert the vibrating head into the concrete. 3.0kW is high power; 380V is industrial voltage not available in homes.",
    descZh:
      "工地大体积水泥浇筑（如桥墩、厂房地面）用；需要接380V三相工业电，棒头插进水泥里振捣；3.0kW是大功率，380V是工厂用电，家庭没有。",
    descZhTw:
      "工地大體積水泥澆築（如橋墩、廠房地面）用；需要接380V三相工業電，棒頭插進水泥裡振搗；3.0kW是大功率，380V是工廠用電，家庭沒有。",
    descMs:
      "Untuk tuangan konkrit berjisim besar di tapak pembinaan seperti tiang jambatan dan lantai kilang. Memerlukan sambungan kuasa industri tiga fasa 380V; masukkan kepala penggetar ke dalam konkrit. 3.0kW adalah kuasa tinggi; 380V adalah voltan industri yang tidak tersedia di rumah.",
    specs: {
      Power: "3.0kW",
      Voltage: "380V",
      Phase: "3-Phase",
      PlugType: "Round Pin",
    },
    price: "380.00",
    stock: 50,
    images: ["https://productstupian.zhenda.store/uploads/EM/3.png"],
  },
  {
    sku: "EM-008",
    categoryId: 3,
    nameEn: "Basso High-Speed Mixer R6125C 1800W",
    nameZh: "巴索高转速搅拌器R6125C",
    nameZhTw: "巴索高轉速攪拌器R6125C",
    nameMs: "Pengadun Kelajuan Tinggi Basso R6125C 1800W",
    descEn:
      "Used for mixing paint, glue, and paste-like chemicals. Insert the mixing head into the bucket, power on and gradually increase speed. 1800W provides strong torque suitable for thick materials.",
    descZh:
      "用于搅拌油漆、胶水、膏状化学品；把搅拌头伸进桶里，接通电源，由慢到快调转速；1800W表示力气大，适合稠的物料。",
    descZhTw:
      "用於攪拌油漆、膠水、膏狀化學品；把攪拌頭伸進桶裡，接通電源，由慢到快調轉速；1800W表示力氣大，適合稠的物料。",
    descMs:
      "Digunakan untuk mengaduk cat, gam, dan bahan kimia berbentuk pes. Masukkan kepala pengadun ke dalam baldi, hidupkan kuasa dan tingkatkan kelajuan secara beransur. 1800W memberikan tork yang kuat sesuai untuk bahan pekat.",
    specs: { Power: "1800W", Model: "R6125C", Type: "High-Speed Mixer" },
    price: "225.00",
    stock: 80,
    images: ["https://productstupian.zhenda.store/uploads/EM/4.png"],
  },
  {
    sku: "EM-009",
    categoryId: 3,
    nameEn: "Binma Electric Drill AZ101 10mm 450W",
    nameZh: "宾马电钻AZ101",
    nameZhTw: "賓馬電鑽AZ101",
    nameMs: "Gerudi Elektrik Binma AZ101 10mm 450W",
    descEn:
      "For drilling small holes (up to 10mm) in wood panels, plasterboard, and thin sheet metal, as well as driving screws. Clamp the drill bit or screwdriver bit, aim at the target and press the switch. 450W is sufficient for household use.",
    descZh:
      "给木板、石膏板、薄铁皮钻小孔（10mm以内），也能拧螺丝；把钻头或螺丝头夹紧，对准位置按开关即可；450W功率够家用。",
    descZhTw:
      "給木板、石膏板、薄鐵皮鑽小孔（10mm以內），也能擰螺絲；把鑽頭或螺絲頭夾緊，對準位置按開關即可；450W功率夠家用。",
    descMs:
      "Untuk menggerudi lubang kecil (sehingga 10mm) pada papan kayu, papan plaster, dan kepingan logam nipis, serta mengikat skru. Ketatkan mata gerudi atau mata pemutar skru, arahkan ke sasaran dan tekan suis. 450W mencukupi untuk kegunaan rumah.",
    specs: { ChuckSize: "10mm", Power: "450W", Model: "AZ101" },
    price: "175.00",
    stock: 150,
    images: ["https://productstupian.zhenda.store/uploads/EM/5.png"],
  },
  {
    sku: "EM-010",
    categoryId: 3,
    nameEn: "Binma Profile Cutting Machine J35501 355mm 3100W",
    nameZh: "宾马型材切割机J35501",
    nameZhTw: "賓馬型材切割機J35501",
    nameMs: "Mesin Pemotong Profil Binma J35501 355mm 3100W",
    descEn:
      "For cutting aluminium alloy window frames, iron pipes, angle steel, and other metal profiles. Secure the material, lower the blade head to cut. 355mm is the blade size; 3100W provides ample power.",
    descZh:
      "用来切割铝合金门窗框、铁管、角钢等金属型材；把材料放好，压下带锯片的机头切割；355mm是锯片大小，3100W力气很足。",
    descZhTw:
      "用來切割鋁合金門窗框、鐵管、角鋼等金屬型材；把材料放好，壓下帶鋸片的機頭切割；355mm是鋸片大小，3100W力氣很足。",
    descMs:
      "Untuk memotong bingkai tingkap aloi aluminium, paip besi, keluli sudut, dan profil logam lain. Selaraskan bahan, turunkan kepala bilah untuk memotong. 355mm adalah saiz bilah; 3100W memberikan kuasa yang mencukupi.",
    specs: {
      BladeSize: "355mm",
      Power: "3100W",
      Model: "J35501",
      Type: "Profile Cutting Machine",
    },
    price: "680.00",
    stock: 40,
    images: ["https://productstupian.zhenda.store/uploads/EM/6.png"],
  },
  {
    sku: "EM-011",
    categoryId: 3,
    nameEn: "Xianchuan Electric Drill XC-C6166X",
    nameZh: "先川电钻XC-C6166X",
    nameZhTw: "先川電鑽XC-C6166X",
    nameMs: "Gerudi Elektrik Xianchuan XC-C6166X",
    descEn:
      "Standard corded hand drill for driving screws and drilling small holes; suitable for assembling furniture or simple repairs. Easy to use: clamp the drill bit or driver bit, aim at the hole position and press the switch.",
    descZh:
      "普通手电钻，拧螺丝、钻小孔都行，适合组装家具或简单维修；使用简单，夹紧钻头或批头，对准孔位按开关。",
    descZhTw:
      "普通手電鑽，擰螺絲、鑽小孔都行，適合組裝家具或簡單維修；使用簡單，夾緊鑽頭或批頭，對準孔位按開關。",
    descMs:
      "Gerudi tangan berkabel standard untuk mengikat skru dan menggerudi lubang kecil; sesuai untuk memasang perabot atau pembaikan mudah. Mudah digunakan: ketatkan mata gerudi atau mata pemacu, arahkan ke kedudukan lubang dan tekan suis.",
    specs: { Model: "XC-C6166X", Type: "Electric Drill" },
    price: "160.00",
    stock: 150,
    images: ["https://productstupian.zhenda.store/uploads/EM/7.png"],
  },
  {
    sku: "EM-012",
    categoryId: 3,
    nameEn: "Fureite Copper-Nozzle Hot Melt Glue Gun 120W 11mm",
    nameZh: "福瑞特铜头热熔胶枪120W",
    nameZhTw: "福瑞特銅頭熱熔膠槍120W",
    nameMs: "Pistol Gam Lebur Panas Muncung Tembaga Fureite 120W 11mm",
    descEn:
      "For bonding crafts, cardboard boxes, and small components. Preheat for 3–5 minutes after plugging in, insert the glue stick from the rear, and pull the trigger to dispense glue. 120W heating power; 11mm glue stick diameter.",
    descZh:
      "用来粘手工、纸盒、小零件；插电预热3-5分钟，把胶棒从后面塞进去，扣扳机出胶；120W是加热功率，胶棒直径11mm。",
    descZhTw:
      "用來粘手工、紙盒、小零件；插電預熱3-5分鐘，把膠棒從後面塞進去，扣扳機出膠；120W是加熱功率，膠棒直徑11mm。",
    descMs:
      "Untuk melekat kraftangan, kotak kadbod, dan komponen kecil. Panaskan selama 3–5 minit selepas disambungkan, masukkan kayu gam dari belakang, dan tarik picu untuk mengeluarkan gam. Kuasa pemanasan 120W; diameter kayu gam 11mm.",
    specs: {
      Power: "120W",
      GlueStickDiameter: "11mm",
      NozzleMaterial: "Copper",
      Type: "Hot Melt Glue Gun",
    },
    price: "28.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/EM/8.png"],
  },
  {
    sku: "EM-013",
    categoryId: 3,
    nameEn: "Binma Stone Cutting Machine AQ11002 110mm 1350W",
    nameZh: "宾马石材切割机AQ11002",
    nameZhTw: "賓馬石材切割機AQ11002",
    nameMs: "Mesin Pemotong Batu Binma AQ11002 110mm 1350W",
    descEn:
      "Specifically for cutting ceramic tiles and marble; can bevel tile edges at 45°. Mount the cutting disc, push slowly along the marked line. 1350W provides strong power; 110mm is the blade size.",
    descZh:
      "专门切瓷砖、大理石，能把瓷砖边切出45°斜角；装好切割片，沿着画好的线慢慢推切；1350W力气大，110mm是切割片尺寸。",
    descZhTw:
      "專門切瓷磚、大理石，能把瓷磚邊切出45°斜角；裝好切割片，沿著畫好的線慢慢推切；1350W力氣大，110mm是切割片尺寸。",
    descMs:
      "Khusus untuk memotong jubin seramik dan marmar; boleh memotong tepi jubin pada sudut 45°. Pasang cakera pemotong, tolak perlahan mengikut garisan yang ditandakan. 1350W memberikan kuasa kuat; 110mm adalah saiz bilah.",
    specs: {
      BladeSize: "110mm",
      Power: "1350W",
      Model: "AQ11002",
      Type: "Stone Cutting Machine",
    },
    price: "230.00",
    stock: 60,
    images: ["https://productstupian.zhenda.store/uploads/EM/9.png"],
  },
  {
    sku: "EM-014",
    categoryId: 3,
    nameEn: "Koleya Electric Angle Steel Punch KLY-20",
    nameZh: "柯莱亚电动角钢冲孔机KLY-20",
    nameZhTw: "柯萊亞電動角鋼衝孔機KLY-20",
    nameMs: "Mesin Tebuk Keluli Sudut Elektrik Koleya KLY-20",
    descEn:
      "Punches round holes directly in sheet metal, angle steel, and cable trays without drilling. Install the upper and lower dies, place the sheet metal in the middle, and press the handle to punch.",
    descZh:
      "在铁皮、角钢、桥架上直接冲圆孔，不用钻孔；先把上下模具装好，把铁皮放中间，压动手柄就能冲孔。",
    descZhTw:
      "在鐵皮、角鋼、橋架上直接衝圓孔，不用鑽孔；先把上下模具裝好，把鐵皮放中間，壓動手柄就能衝孔。",
    descMs:
      "Menebuk lubang bulat terus pada kepingan logam, keluli sudut, dan dulang kabel tanpa menggerudi. Pasang acuan atas dan bawah, letakkan kepingan logam di tengah, dan tekan pemegang untuk menebuk.",
    specs: { Model: "KLY-20", Type: "Electric Angle Steel Punch" },
    price: "680.00",
    stock: 30,
    images: ["https://productstupian.zhenda.store/uploads/EM/10.png"],
  },
  {
    sku: "EM-015",
    categoryId: 3,
    nameEn: "Binma Electric Demolition Hammer G3901 17HEX 1500W",
    nameZh: "宾马电镐G3901",
    nameZhTw: "賓馬電鎬G3901",
    nameMs: "Tukul Pembongkaran Elektrik Binma G3901 17HEX 1500W",
    descEn:
      "For demolishing walls, chipping old floor tiles, and breaking concrete. Attach a flat chisel or pointed chisel, plug in, hold firmly with both hands and press against the surface to break. 1500W delivers strong impact force.",
    descZh:
      "用来拆墙、铲地面旧瓷砖、凿掉混凝土；换上扁铲或尖凿，插电后双手握紧，对准要破碎的地方用力顶；1500W冲击力强。",
    descZhTw:
      "用來拆牆、鏟地面舊瓷磚、鑿掉混凝土；換上扁鏟或尖鑿，插電後雙手握緊，對準要破碎的地方用力頂；1500W衝擊力強。",
    descMs:
      "Untuk merobohkan dinding, menanggalkan jubin lantai lama, dan memecahkan konkrit. Pasang pahat rata atau pahat runcing, sambungkan bekalan elektrik, pegang kukuh dengan kedua tangan dan tekan ke permukaan untuk memecah. 1500W menghasilkan daya hentaman yang kuat.",
    specs: {
      ChiselFit: "17mm HEX",
      Power: "1500W",
      Model: "G3901",
      Type: "Electric Demolition Hammer",
    },
    price: "520.00",
    stock: 50,
    images: ["https://productstupian.zhenda.store/uploads/EM/11.png"],
  },
  {
    sku: "EM-016",
    categoryId: 3,
    nameEn: "Laode Electric Demolition Hammer 150 2000W",
    nameZh: "劳得电镐150",
    nameZhTw: "勞得電鎬150",
    nameMs: "Tukul Pembongkaran Elektrik Laode 150 2000W",
    descEn:
      "Heavy-duty demolition tool for breaking road surfaces, frozen ground, and large concrete blocks. Operation is the same as a standard demolition hammer but with greater power. 2000W — more powerful than smaller models.",
    descZh:
      "更大型的破拆工具，用于路面、冻土、大块混凝土破碎；方法同电镐，力气更大；2000W功率，比上面那款更猛。",
    descZhTw:
      "更大型的破拆工具，用於路面、凍土、大塊混凝土破碎；方法同電鎬，力氣更大；2000W功率，比上面那款更猛。",
    descMs:
      "Alat pembongkaran berat untuk memecah permukaan jalan, tanah beku, dan blok konkrit besar. Operasi sama seperti tukul pembongkaran biasa tetapi dengan kuasa yang lebih besar. 2000W — lebih berkuasa daripada model yang lebih kecil.",
    specs: { Power: "2000W", Model: "150", Type: "Electric Demolition Hammer" },
    price: "1040.00",
    stock: 30,
    images: ["https://productstupian.zhenda.store/uploads/EM/12.png"],
  },
  {
    sku: "EM-017",
    categoryId: 3,
    nameEn: "Hengjie Pneumatic Angle Grinder JMJ100",
    nameZh: "恒杰气动角磨机JMJ100",
    nameZhTw: "恒杰氣動角磨機JMJ100",
    nameMs: "Pengisar Sudut Pneumatik Hengjie JMJ100",
    descEn:
      "For grinding welds, cutting thin sheet metal, and polishing metal surfaces. Requires an air compressor; connect compressed air, grip the body, and apply the grinding wheel to the workpiece.",
    descZh:
      "用来打磨焊点、切割薄铁皮、抛光金属表面；需要接空压机（气泵），通压缩空气后握住机身，用砂轮片打磨。",
    descZhTw:
      "用來打磨焊點、切割薄鐵皮、拋光金屬表面；需要接空壓機（氣泵），通壓縮空氣後握住機身，用砂輪片打磨。",
    descMs:
      "Untuk menggilap kimpalan, memotong kepingan logam nipis, dan memoles permukaan logam. Memerlukan pemampat udara; sambungkan udara termampat, pegang badan mesin, dan sapukan roda penggilas ke benda kerja.",
    specs: {
      Model: "JMJ100",
      Type: "Pneumatic Angle Grinder",
      PowerSource: "Compressed Air",
    },
    price: "165.00",
    stock: 80,
    images: ["https://productstupian.zhenda.store/uploads/EM/13.png"],
  },
  {
    sku: "EM-018",
    categoryId: 3,
    nameEn: "Rongchuang Gasless MIG Welder MIG-270K",
    nameZh: "蓉创一体式无气自保焊机MIG-270K",
    nameZhTw: "蓉創一體式無氣自保焊機MIG-270K",
    nameMs: "Mesin Kimpalan MIG Tanpa Gas Rongchuang MIG-270K",
    descEn:
      "For welding iron and stainless steel sheets without an external gas cylinder; the flux-cored wire provides its own shielding. Connect the power and ground clamp, adjust the current, and pull the welding gun trigger to weld.",
    descZh:
      "焊接铁板、不锈钢板，不用外接气瓶，焊丝自带保护；接好电源和地线，调节电流，扣动焊枪开关进行焊接。",
    descZhTw:
      "焊接鐵板、不鏽鋼板，不用外接氣瓶，焊絲自帶保護；接好電源和地線，調節電流，扣動焊槍開關進行焊接。",
    descMs:
      "Untuk mengimpal kepingan besi dan keluli tahan karat tanpa silinder gas luaran; wayar teras fluks menyediakan pelindungnya sendiri. Sambungkan bekalan kuasa dan pengapit bumi, laraskan arus, dan tarik picu pistol kimpalan untuk mengimpal.",
    specs: {
      Model: "MIG-270K",
      Type: "Gasless MIG Welder",
      WireType: "Flux-Cored",
    },
    price: "1270.00",
    stock: 25,
    images: ["https://productstupian.zhenda.store/uploads/EM/14.png"],
  },
  {
    sku: "EM-019",
    categoryId: 3,
    nameEn: "Rongchuang Built-in Pump Plasma Cutter LGK-60S",
    nameZh: "蓉创内置气泵等离子切割机LGK-60S",
    nameZhTw: "蓉創內置氣泵等離子切割機LGK-60S",
    nameMs: "Mesin Pemotong Plasma Pam Terbina Dalam Rongchuang LGK-60S",
    descEn:
      "For fast cutting of various thin metal sheets (iron, stainless steel, aluminium). The built-in air pump requires no external air supply; press the cutting torch switch to generate a high-temperature plasma arc that cuts through metal.",
    descZh:
      "用来快速切割各种金属薄板（铁、不锈钢、铝）；机器自带气泵，不用外接气源，按下割枪开关就能产生高温等离子弧切开金属。",
    descZhTw:
      "用來快速切割各種金屬薄板（鐵、不鏽鋼、鋁）；機器自帶氣泵，不用外接氣源，按下割槍開關就能產生高溫等離子弧切開金屬。",
    descMs:
      "Untuk memotong pelbagai kepingan logam nipis (besi, keluli tahan karat, aluminium) dengan cepat. Pam udara terbina dalam tidak memerlukan bekalan udara luaran; tekan suis obor pemotong untuk menjana arka plasma bersuhu tinggi yang memotong logam.",
    specs: {
      Model: "LGK-60S",
      Type: "Plasma Cutter",
      AirSupply: "Built-in Pump",
    },
    price: "1820.00",
    stock: 20,
    images: ["https://productstupian.zhenda.store/uploads/EM/15.png"],
  },
  {
    sku: "EM-020",
    categoryId: 3,
    nameEn: "Jinshi Pipe Tapping Machine 114 Type 220V",
    nameZh: "锦石打孔机114型/220V",
    nameZhTw: "錦石打孔機114型/220V",
    nameMs: "Mesin Tebuk Paip Jinshi Jenis 114 220V",
    descEn:
      "For pressure tapping on water supply pipes (iron or galvanized) to add branch connections while the pipe remains under pressure. Secure the machine to the pipe with a chain and slowly drill through. Maximum hole diameter 114mm.",
    descZh:
      "用在自来水管道上（铁管、镀锌管）带压开孔，以便接分支水管；用链条把机器固定在管子上，慢慢钻头钻进去；最大可打直径114毫米的孔。",
    descZhTw:
      "用在自來水管道上（鐵管、鍍鋅管）帶壓開孔，以便接分支水管；用鏈條把機器固定在管子上，慢慢鑽頭鑽進去；最大可打直徑114毫米的孔。",
    descMs:
      "Untuk membuat lubang bertekanan pada paip bekalan air (paip besi atau galvanis) bagi menambah sambungan cawangan semasa paip masih bertekanan. Selaraskan mesin ke paip dengan rantai dan gerudi perlahan-lahan. Diameter lubang maksimum 114mm.",
    specs: {
      Model: "114 Type",
      Voltage: "220V",
      MaxDiameter: "114mm",
      Type: "Pipe Tapping Machine",
    },
    price: "0.00",
    stock: 20,
    images: ["https://productstupian.zhenda.store/uploads/EM/16.png"],
  },
  {
    sku: "EM-021",
    categoryId: 3,
    nameEn: "Haitu Jinlong Petrol Road Cutter 500SC-190 (Pull Start)",
    nameZh: "海途金龙汽油马路切割机500SC-190（手启动）",
    nameZhTw: "海途金龍汽油馬路切割機500SC-190（手啟動）",
    nameMs: "Mesin Pemotong Jalan Petrol Haitu Jinlong 500SC-190 (Tarik Mula)",
    descEn:
      "For cutting concrete and asphalt road surfaces, e.g. for road joint cutting during repairs. Fill with petrol, pull-start the engine, push forward and cut slowly along the marked line.",
    descZh:
      "切割水泥路面、沥青路面，比如修路切缝；加汽油，拉动手拉盘启动，推着走，沿着标线慢慢切。",
    descZhTw:
      "切割水泥路面、瀝青路面，比如修路切縫；加汽油，拉動手拉盤啟動，推著走，沿著標線慢慢切。",
    descMs:
      "Untuk memotong permukaan jalan konkrit dan asfalt, contohnya pemotongan sendi jalan semasa pembaikan. Isi minyak petrol, tarik pemacu untuk menghidupkan enjin, tolak ke hadapan dan potong perlahan mengikut garisan yang ditandakan.",
    specs: {
      Model: "500SC-190",
      StartType: "Pull Start",
      FuelType: "Petrol",
      Type: "Road Cutter",
    },
    price: "2620.00",
    stock: 10,
    images: ["https://productstupian.zhenda.store/uploads/EM/17.png"],
  },
  {
    sku: "EM-022",
    categoryId: 3,
    nameEn: "Xianchuan Dual-Mode Rotary Hammer XC-C1029B",
    nameZh: "先川双用电锤XC-C1029B",
    nameZhTw: "先川雙用電錘XC-C1029B",
    nameMs: "Tukul Putar Dwi-Mod Xianchuan XC-C1029B",
    descEn:
      "Can drill holes in concrete walls (for expansion bolts) and also function as a regular electric drill. Mode selector switch: hammer drill mode for walls; drill mode for wood and metal.",
    descZh:
      "可在混凝土墙上打孔（装膨胀螺栓），也能当普通电钻用；有模式切换旋钮：锤钻模式打墙，电钻模式钻木头/铁。",
    descZhTw:
      "可在混凝土牆上打孔（裝膨脹螺栓），也能當普通電鑽用；有模式切換旋鈕：錘鑽模式打牆，電鑽模式鑽木頭/鐵。",
    descMs:
      "Boleh menggerudi lubang pada dinding konkrit (untuk bolt pengembang) dan juga berfungsi sebagai gerudi elektrik biasa. Suis pemilih mod: mod tukul gerudi untuk dinding; mod gerudi untuk kayu dan logam.",
    specs: {
      Model: "XC-C1029B",
      Type: "Dual-Mode Rotary Hammer",
      Modes: "Hammer Drill / Drill",
    },
    price: "245.00",
    stock: 100,
    images: ["https://productstupian.zhenda.store/uploads/EM/18.png"],
  },
  {
    sku: "EM-023",
    categoryId: 3,
    nameEn: "Beiqi Mobile Screw Compressor YDPM4.5-8/220V (No Cover) 4.5kW",
    nameZh: "北气移动式螺杆机YDPM4.5-8/220V不带罩",
    nameZhTw: "北氣移動式螺桿機YDPM4.5-8/220V不帶罩",
    nameMs:
      "Pemampat Skru Mudah Alih Beiqi YDPM4.5-8/220V (Tanpa Penutup) 4.5kW",
    descEn:
      "Supplies compressed air to pneumatic tools such as air wrenches and spray guns. Connect to 220V, power on for automatic compression; can be wheeled around. Pressure 8 bar, airflow 0.6 m³/min.",
    descZh:
      "给气动工具（如气动扳手、喷漆枪）提供压缩空气；接220V电，开机后自动打气，可推着移动；压力8公斤，出气量0.6立方米每分钟。",
    descZhTw:
      "給氣動工具（如氣動扳手、噴漆槍）提供壓縮空氣；接220V電，開機後自動打氣，可推著移動；壓力8公斤，出氣量0.6立方米每分鐘。",
    descMs:
      "Membekalkan udara termampat kepada alat pneumatik seperti kunci pneumatik dan pistol semburan. Sambungkan ke 220V, hidupkan untuk pemampatan automatik; boleh ditolak bergerak. Tekanan 8 bar, aliran udara 0.6 m³/min.",
    specs: {
      Power: "4.5kW",
      Voltage: "220V",
      Pressure: "8 bar",
      Airflow: "0.6 m³/min",
      Model: "YDPM4.5-8/220V",
      Type: "Mobile Screw Compressor",
    },
    price: "3920.00",
    stock: 10,
    images: ["https://productstupian.zhenda.store/uploads/EM/19.png"],
  },
  {
    sku: "EM-024",
    categoryId: 3,
    nameEn: "Fureite Transparent Cartridge Caulking Gun 15-inch",
    nameZh: "福瑞特透明管筒装式压胶枪",
    nameZhTw: "福瑞特透明管筒裝式壓膠槍",
    nameMs: "Pistol Gam Tiub Lutsinar Fureite 15 inci",
    descEn:
      "For applying silicone sealant, grout, and structural adhesive. Insert the cartridge into the gun body, pull the trigger and the adhesive is squeezed from the nozzle. The transparent tube lets you see how much adhesive remains.",
    descZh:
      "用来打玻璃胶、美缝剂、结构胶；把胶筒放进枪身，扣动扳机，胶就从前面挤出来；透明管可以看到剩余多少胶。",
    descZhTw:
      "用來打玻璃膠、美縫劑、結構膠；把膠筒放進槍身，扣動扳機，膠就從前面擠出來；透明管可以看到剩餘多少膠。",
    descMs:
      "Untuk menggunakan pengedap silikon, graut, dan pelekat struktur. Masukkan kartrij ke dalam badan pistol, tarik picu dan pelekat diperah dari muncung. Tiub lutsinar membolehkan anda melihat baki pelekat yang tinggal.",
    specs: {
      Size: "15 inch",
      TubeType: "Transparent Cartridge",
      Type: "Caulking Gun",
    },
    price: "12.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/EM/20.png"],
  },
  {
    sku: "EM-025",
    categoryId: 3,
    nameEn: "Shendawei Optical Level SW-32A",
    nameZh: "深达威水准仪SW-32A",
    nameZhTw: "深達威水準儀SW-32A",
    nameMs: "Aras Optik Shendawei SW-32A",
    descEn:
      "For measuring levels and setting out datum lines on construction sites; checks whether floors or walls are horizontal. Mount on a tripod, level it, then read the levelling staff through the telescope.",
    descZh:
      "工地测量水平、抄平放线用，检查地面或墙面是否水平；架在三脚架上，调平后通过望远镜观察水准尺读数。",
    descZhTw:
      "工地測量水平、抄平放線用，檢查地面或牆面是否水平；架在三腳架上，調平後通過望遠鏡觀察水準尺讀數。",
    descMs:
      "Untuk mengukur aras dan meletakkan garisan datum di tapak pembinaan; memeriksa sama ada lantai atau dinding adalah mendatar. Pasang pada tripod, ratakan, kemudian baca rod penentuan aras melalui teleskop.",
    specs: { Model: "SW-32A", Type: "Optical Level", Magnification: "32×" },
    price: "420.00",
    stock: 30,
    images: ["https://productstupian.zhenda.store/uploads/EM/21.png"],
  },
  {
    sku: "EM-026",
    categoryId: 3,
    nameEn: "Xianchuan Circular Saw XC-C1255",
    nameZh: "先川电圆锯XC-C1255",
    nameZhTw: "先川電圓鋸XC-C1255",
    nameMs: "Gergaji Bulat Xianchuan XC-C1255",
    descEn:
      "For cutting wood panels, plywood, skirting boards, and other carpentry materials. Adjust the cutting depth, keep the blade against the guide fence and push the saw forward with both hands.",
    descZh:
      "用来切割木板、多层板、踢脚线等木工活；调整好切割深度，锯片靠紧导尺，双手推着锯前进。",
    descZhTw:
      "用來切割木板、多層板、踢腳線等木工活；調整好切割深度，鋸片靠緊導尺，雙手推著鋸前進。",
    descMs:
      "Untuk memotong papan kayu, kayu lapis, papan skirting, dan bahan pertukangan kayu lain. Laraskan kedalaman pemotongan, tahan bilah rapat pada pagar panduan dan tolak gergaji ke hadapan dengan kedua tangan.",
    specs: { Model: "XC-C1255", Type: "Circular Saw" },
    price: "380.00",
    stock: 60,
    images: ["https://productstupian.zhenda.store/uploads/EM/22.png"],
  },
  {
    sku: "EM-027",
    categoryId: 3,
    nameEn: "Xianchuan Angle Grinder XC-C71006X",
    nameZh: "先川角向磨光机XC-C71006X",
    nameZhTw: "先川角向磨光機XC-C71006X",
    nameMs: "Pengisar Sudut Xianchuan XC-C71006X",
    descEn:
      "For grinding and cutting small metal pieces or cutting PVC pipes. Mount a grinding disc or cutting disc, grip the body, and move the disc edge slowly across the workpiece.",
    descZh:
      "可用来打磨、切割小铁件或切PVC管；装上砂轮片或切割片，握住机身，让砂轮边缘接触工件慢慢移动。",
    descZhTw:
      "可用來打磨、切割小鐵件或切PVC管；裝上砂輪片或切割片，握住機身，讓砂輪邊緣接觸工件慢慢移動。",
    descMs:
      "Untuk menggilap dan memotong bahagian logam kecil atau memotong paip PVC. Pasang cakera penggilas atau cakera pemotong, pegang badan mesin, dan gerakkan tepi cakera perlahan-lahan merentasi benda kerja.",
    specs: { Model: "XC-C71006X", Type: "Angle Grinder" },
    price: "90.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/EM/23.png"],
  },
  {
    sku: "EM-028",
    categoryId: 3,
    nameEn: "Basso Portable Vacuum Cleaner R7701 700W",
    nameZh: "巴索便携式吸尘器R7701（博来）",
    nameZhTw: "巴索便攜式吸塵器R7701（博來）",
    nameMs: "Pembersih Vakum Mudah Alih Basso R7701 700W",
    descEn:
      "For everyday vacuuming of dust, paper scraps, and car interiors. Plug in, attach the suction head, and press the switch. 700W provides moderate suction suitable for small-area cleaning.",
    descZh:
      "日常吸尘、吸纸屑、吸车内灰尘；插上电，装上吸头，按开关即可；700W功率，吸力适中，适合小面积清洁。",
    descZhTw:
      "日常吸塵、吸紙屑、吸車內灰塵；插上電，裝上吸頭，按開關即可；700W功率，吸力適中，適合小面積清潔。",
    descMs:
      "Untuk pembersihan habuk harian, keratan kertas, dan bahagian dalam kereta. Sambungkan bekalan elektrik, pasang kepala sedutan, dan tekan suis. 700W memberikan sedutan sederhana sesuai untuk pembersihan kawasan kecil.",
    specs: { Model: "R7701", Power: "700W", Type: "Portable Vacuum Cleaner" },
    price: "230.00",
    stock: 80,
    images: ["https://productstupian.zhenda.store/uploads/EM/24.png"],
  },
  {
    sku: "EM-029",
    categoryId: 3,
    nameEn: "Yuyue Submersible Pump QDX1.5-16-0.37/220V",
    nameZh: "鱼越潜水泵QDX1.5-16-0.37/220",
    nameZhTw: "魚越潛水泵QDX1.5-16-0.37/220",
    nameMs: "Pam Selam Yuyue QDX1.5-16-0.37/220V",
    descEn:
      "For pumping water from flooded basements, fish ponds, or irrigation. Submerge the entire pump in water, connect 220V power and water automatically flows from the outlet. Flow rate 1.5 m³/h; max head 9.2m (approx. 3 storeys).",
    descZh:
      "用于抽水，比如地下室积水、鱼塘换水、浇菜地；整个泵放进水里，接220V电，水会自动从出口排出；流量每小时1.5立方米，扬程最高9.2米（大概3层楼高）。",
    descZhTw:
      "用於抽水，比如地下室積水、魚塘換水、澆菜地；整個泵放進水裡，接220V電，水會自動從出口排出；流量每小時1.5立方米，揚程最高9.2米（大概3層樓高）。",
    descMs:
      "Untuk mengepam air dari ruang bawah tanah yang banjir, kolam ikan, atau pengairan. Rendam keseluruhan pam dalam air, sambungkan bekalan kuasa 220V dan air mengalir keluar secara automatik. Kadar aliran 1.5 m³/j; turus maksimum 9.2m (kira-kira 3 tingkat).",
    specs: {
      Model: "QDX1.5-16-0.37",
      Voltage: "220V",
      FlowRate: "1.5 m³/h",
      MaxHead: "9.2m",
      OutletSize: "1 inch",
      Type: "Submersible Pump",
    },
    price: "155.00",
    stock: 60,
    images: ["https://productstupian.zhenda.store/uploads/EM/25.png"],
  },
  {
    sku: "EM-030",
    categoryId: 3,
    nameEn: "Xianchuan Electric Drill XC-C6105X",
    nameZh: "先川手电钻XC-C6105X",
    nameZhTw: "先川手電鑽XC-C6105X",
    nameMs: "Gerudi Elektrik Tangan Xianchuan XC-C6105X",
    descEn:
      "Simple corded hand drill for driving screws and drilling thin boards and thin wood. Easy to use: clamp the drill bit and press the switch. A basic entry-level model.",
    descZh:
      "简单的插电手钻，拧螺丝、钻薄板、薄木头用；操作简单，夹好钻头，按开关即可；非常基础款。",
    descZhTw:
      "簡單的插電手鑽，擰螺絲、鑽薄板、薄木頭用；操作簡單，夾好鑽頭，按開關即可；非常基礎款。",
    descMs:
      "Gerudi tangan berkabel mudah untuk mengikat skru dan menggerudi papan nipis dan kayu nipis. Mudah digunakan: ketatkan mata gerudi dan tekan suis. Model asas peringkat permulaan.",
    specs: { Model: "XC-C6105X", Type: "Electric Hand Drill" },
    price: "90.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/EM/26.png"],
  },
  {
    sku: "EM-031",
    categoryId: 3,
    nameEn: "Basso Multi-Function Saw R5102B Quick-Change 400W",
    nameZh: "巴索多功能锯R5102B快装",
    nameZhTw: "巴索多功能鋸R5102B快裝",
    nameMs: "Gergaji Pelbagai Fungsi Basso R5102B Tukar Pantas 400W",
    descEn:
      "Can saw wood, thin iron pipes, and plasterboard; blades change quickly. Mount the appropriate blade, power on and cut along the marked line. 400W power; suitable for small workpieces.",
    descZh:
      "可锯木头、薄铁管、石膏板，能快速换锯条；装上合适的锯片，通电后沿着画好的线切割；400W功率，适合小件切割。",
    descZhTw:
      "可鋸木頭、薄鐵管、石膏板，能快速換鋸條；裝上合適的鋸片，通電後沿著畫好的線切割；400W功率，適合小件切割。",
    descMs:
      "Boleh menggergaji kayu, paip besi nipis, dan papan plaster; bilah bertukar dengan cepat. Pasang bilah yang sesuai, hidupkan bekalan kuasa dan potong mengikut garisan yang ditandakan. Kuasa 400W; sesuai untuk benda kerja kecil.",
    specs: {
      Model: "R5102B",
      Power: "400W",
      Type: "Multi-Function Saw",
      BladeChange: "Quick-Change",
    },
    price: "185.00",
    stock: 80,
    images: ["https://productstupian.zhenda.store/uploads/EM/27.png"],
  },
  {
    sku: "SC-001",
    categoryId: 4,
    nameEn: "M8x30 Hex Bolt Grade 8.8",
    nameZh: "M8x30六角螺栓 8.8级",
    nameZhTw: "M8x30六角螺栓 8.8級",
    nameMs: "Bolt Hex M8x30 Gred 8.8",
    descEn:
      "High-tensile hex bolt for structural and mechanical assemblies. Pack of 50.",
    descZh: "高强度六角螺栓，用于结构和机械装配。50只装。",
    descZhTw: "高強度六角螺栓，用於結構和機械裝配。50只裝。",
    descMs:
      "Bolt hex tegangan tinggi untuk pemasangan struktur dan mekanikal. Pek 50.",
    specs: {
      Size: "M8x30mm",
      Grade: "8.8",
      Material: "Carbon Steel",
      Finish: "Zinc Plated",
      Pack: "50 pcs",
    },
    price: "15.60",
    stock: 1500,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "SC-002",
    categoryId: 4,
    nameEn: "M4x16 Socket Head Cap Screw",
    nameZh: "M4x16内六角螺钉",
    nameZhTw: "M4x16內六角螺釘",
    nameMs: "Skru Kepala Soket M4x16",
    descEn:
      "Precision socket head cap screw for machine assembly. Pack of 100.",
    descZh: "精密内六角螺钉，用于机器装配。100只装。",
    descZhTw: "精密內六角螺釘，用於機器裝配。100只裝。",
    descMs: "Skru kepala soket tepat untuk pemasangan mesin. Pek 100.",
    specs: {
      Size: "M4x16mm",
      Grade: "12.9",
      Material: "Alloy Steel",
      Finish: "Black Oxide",
      Pack: "100 pcs",
    },
    price: "8.90",
    stock: 2500,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "SC-003",
    categoryId: 4,
    nameEn: "M6 Stainless Steel Flat Washer",
    nameZh: "M6不锈钢平垫圈",
    nameZhTw: "M6不鏽鋼平墊圈",
    nameMs: "Pencuci Rata Keluli Tahan Karat M6",
    descEn:
      "A2 stainless steel flat washer for corrosion-resistant assemblies. Pack of 200.",
    descZh: "A2不锈钢平垫圈，用于耐腐蚀装配。200只装。",
    descZhTw: "A2不鏽鋼平墊圈，用於耐腐蝕裝配。200只裝。",
    descMs:
      "Pencuci rata keluli tahan karat A2 untuk pemasangan tahan kakisan. Pek 200.",
    specs: {
      Size: "M6",
      Material: "A2 Stainless Steel",
      OD: "12mm",
      Thickness: "1.6mm",
      Pack: "200 pcs",
    },
    price: "6.20",
    stock: 3000,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "SC-004",
    categoryId: 4,
    nameEn: "M10 Nylon Lock Nut DIN 985",
    nameZh: "M10尼龙锁紧螺母 DIN 985",
    nameZhTw: "M10尼龍鎖緊螺母 DIN 985",
    nameMs: "Nat Kunci Nilon M10 DIN 985",
    descEn:
      "Self-locking nylon insert nut for vibration-resistant connections. Pack of 50.",
    descZh: "自锁尼龙嵌入螺母，用于防振连接。50只装。",
    descZhTw: "自鎖尼龍嵌入螺母，用於防振連接。50只裝。",
    descMs:
      "Nat sisipan nilon kunci sendiri untuk sambungan tahan getaran. Pek 50.",
    specs: {
      Size: "M10",
      Material: "Carbon Steel + Nylon",
      Grade: "8",
      Finish: "Zinc Plated",
      Pack: "50 pcs",
    },
    price: "7.80",
    stock: 1800,
    images: ["https://oss.aliyun.com"],
  },
  {
    sku: "SC-005",
    categoryId: 4,
    nameEn: "Phillips Self-Tapping Screw",
    nameZh: "十字槽自攻钉螺丝",
    nameZhTw: "十字槽自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Philips Skru",
    descEn:
      "Widely used for wood furniture panel joining, interior ceiling joist fixing, gypsum board installation, and wall hardware fitting. Drives directly into wood without pre-drilling; pair with a power Phillips bit for high installation efficiency.",
    descZh:
      "广泛用于木质家具板材拼接、室内吊顶龙骨固定、石膏板安装及墙壁五金配件固定，在家具厂组装衣柜和橱柜时无需预先钻孔即可直接拧入木板，搭配电动十字批头可大幅提升安装效率。",
    descZhTw:
      "廣泛用於木質家具板材拼接、室內吊頂龍骨固定、石膏板安裝及牆壁五金配件固定，在家具廠組裝衣櫃和廚櫃時無需預先鑽孔即可直接擰入木板，搭配電動十字批頭可大幅提升安裝效率。",
    descMs:
      "Digunakan secara meluas untuk penyambungan panel perabot kayu, pemasangan kerangka siling dalaman, pemasangan papan gipsum, dan pemasangan perkakasan dinding. Boleh dimasukkan terus ke kayu tanpa pra-gerudi; gunakan bersama bit Philips berkuasa untuk kecekapan pemasangan yang tinggi.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture1.png"],
  },
  {
    sku: "SC-006",
    categoryId: 4,
    nameEn: "Hex Head Wood Screw",
    nameZh: "六角头木螺钉螺丝",
    nameZhTw: "六角頭木螺釘螺絲",
    nameMs: "Skru Kayu Kepala Hex Skru",
    descEn:
      "Hexagonal head for timber roof truss connections, outdoor wood structure reinforcement, and solid wood bed frame assembly. Provides higher pull-out resistance than traditional nails; tighten with an open-end wrench or socket wrench.",
    descZh:
      "头部呈六边形设计，主要应用于木屋桁架连接、户外木质结构加固以及家装中的实木床腿与床架固定，相比传统铁钉能提供更高的抗拔承载力，安装时应使用开口扳手或套筒扳手配合电钻进行旋紧。",
    descZhTw:
      "頭部呈六邊形設計，主要應用於木屋桁架連接、戶外木質結構加固以及家裝中的實木床腿與床架固定，相比傳統鐵釘能提供更高的抗拔承載力，安裝時應使用開口扳手或套筒扳手配合電鑽進行旋緊。",
    descMs:
      "Kepala heksagon untuk sambungan kuda-kuda bumbung kayu, pengukuhan struktur kayu luar, dan pemasangan rangka katil kayu pejal. Memberikan rintangan cabutan lebih tinggi berbanding paku biasa; ketatkan dengan sepana hujung terbuka atau kunci soket.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture2.png"],
  },
  {
    sku: "SC-007",
    categoryId: 4,
    nameEn: "Phillips Machine Screw",
    nameZh: "十字槽机螺钉螺丝",
    nameZhTw: "十字槽機螺釘螺絲",
    nameMs: "Skru Mesin Philips Skru",
    descEn:
      "Requires a nut or pre-tapped hole. Widely used for industrial machinery component fastening, electronic device enclosure assembly, and home appliance internal connections. Ensure thread is clean and matched; 1–2 exposed threads beyond the nut are recommended after installation.",
    descZh:
      "通常需配合螺母或预攻螺纹孔使用，广泛用于工业机械设备零部件固定、电子设备外壳组装以及家用电器内部组件连接，使用时需确保底孔螺纹清洁且尺寸匹配，拧入后建议露出螺母端1-2个螺牙以确保紧固度。",
    descZhTw:
      "通常需配合螺母或預攻螺紋孔使用，廣泛用於工業機械設備零部件固定、電子設備外殼組裝以及家用電器內部組件連接，使用時需確保底孔螺紋清潔且尺寸匹配，擰入後建議露出螺母端1-2個螺牙以確保緊固度。",
    descMs:
      "Memerlukan nat atau lubang pra-ditap. Digunakan secara meluas untuk pengencangan komponen jentera industri, pemasangan penutup peranti elektronik, dan sambungan komponen dalaman peralatan rumah. Pastikan benang bersih dan sepadan; 1–2 benang terdedah di luar nat disyorkan selepas pemasangan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture3.png"],
  },
  {
    sku: "SC-008",
    categoryId: 4,
    nameEn: "Hex Socket Self-Tapping Screw",
    nameZh: "内六角自攻钉螺丝",
    nameZhTw: "內六角自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Soket Hex Skru",
    descEn:
      "Recessed hex socket head for concealed furniture panel joining, cabinet hinge and drawer slide installation. Also suitable for automotive interior trim and machinery component fastening. Ideal for confined spaces with high pre-load torque; requires a hex key or dedicated bit.",
    descZh:
      "头部采用内六角凹槽结构，主要用于木质家具隐形式板材拼接、柜门铰链与抽屉滑轨安装，同时也适用于汽车内饰件固定和机械设备组件连接，内六角设计适合狭小空间操作且能承受较大的预紧力，安装时需使用内六角扳手或专用批头。",
    descZhTw:
      "頭部採用內六角凹槽結構，主要用於木質家具隱形式板材拼接、櫃門鉸鏈與抽屜滑軌安裝，同時也適用於汽車內飾件固定和機械設備組件連接，內六角設計適合狹小空間操作且能承受較大的預緊力，安裝時需使用內六角扳手或專用批頭。",
    descMs:
      "Kepala soket hex tersembunyi untuk penyambungan panel perabot yang tersembunyi, pemasangan engsel pintu kabinet dan geluncur laci. Sesuai untuk pemasangan trim dalaman automotif dan komponen jentera. Ideal untuk ruang sempit dengan tork pra-beban tinggi; memerlukan kunci hex atau bit khusus.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture4.png"],
  },
  {
    sku: "SC-009",
    categoryId: 4,
    nameEn: "Hex Socket Machine Screw",
    nameZh: "内六角机螺钉螺丝",
    nameZhTw: "內六角機螺釘螺絲",
    nameMs: "Skru Mesin Soket Hex Skru",
    descEn:
      "Machine thread for automation equipment enclosure installation, CNC machine component fastening, industrial robot joint connections, and electrical control cabinet component fixing. Select the appropriate hex key size based on screw length.",
    descZh:
      "螺纹为机械牙设计，广泛应用于自动化设备外壳安装、机床部件紧固、工业机器人关节连接以及电气控制柜内部组件固定，安装时根据长度选择对应规格的内六角扳手旋紧即可。",
    descZhTw:
      "螺紋為機械牙設計，廣泛應用於自動化設備外殼安裝、機床部件緊固、工業機器人關節連接以及電氣控制櫃內部組件固定，安裝時根據長度選擇對應規格的內六角扳手旋緊即可。",
    descMs:
      "Benang mesin untuk pemasangan penutup peralatan automasi, pengencangan komponen mesin CNC, sambungan sendi robot industri, dan penetapan komponen dalaman kabinet kawalan elektrik. Pilih saiz kunci hex yang sesuai berdasarkan panjang skru.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture5.png"],
  },
  {
    sku: "SC-010",
    categoryId: 4,
    nameEn: "Hex Head Self-Tapping Screw",
    nameZh: "六角头自攻钉螺丝",
    nameZhTw: "六角頭自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Kepala Hex Skru",
    descEn:
      "Hexagonal head with integrated flange washer for light steel framing and gypsum board, color-coated steel roofing, building curtain wall framing, and home appliance enclosure assembly. Withstands higher torque than Phillips; use an electric socket wrench to lock in place.",
    descZh:
      "头部为六角形且常带法兰垫圈，专用于轻钢龙骨与石膏板连接、彩钢瓦屋顶薄板固定、建筑幕墙骨架搭建以及家用电器外壳装配，能承受比十字槽更大的扭矩，推荐搭配电动套筒扳手直接锁紧。",
    descZhTw:
      "頭部為六角形且常帶法蘭墊圈，專用於輕鋼龍骨與石膏板連接、彩鋼瓦屋頂薄板固定、建築幕牆骨架搭建以及家用電器外殼裝配，能承受比十字槽更大的扭矩，推薦搭配電動套筒扳手直接鎖緊。",
    descMs:
      "Kepala heksagon dengan penyemat flange bersepadu untuk rangka keluli ringan dan papan gipsum, bumbung keluli berwarna, rangka dinding tirai bangunan, dan pemasangan penutup peralatan rumah. Menahan tork lebih tinggi daripada Philips; gunakan sepana soket elektrik untuk mengunci.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture6.png"],
  },
  {
    sku: "SC-011",
    categoryId: 4,
    nameEn: "Torx Self-Tapping Screw",
    nameZh: "梅花槽自攻钉螺丝",
    nameZhTw: "梅花槽自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Torx Skru",
    descEn:
      "Six-lobe anti-slip Torx drive for smartphone metal frame assembly, EV charging station enclosure fastening, control cabinet internal locking, and high-end furniture panel connections. High torque transfer prevents cam-out; requires a Torx bit with power tool.",
    descZh:
      "槽型呈六角梅花状防滑设计，广泛用于手机金属中框精密装配、新能源汽车充电桩外壳固定、设备控制柜内部结构锁紧以及高档家具板材连接，利用梅花槽的高扭矩传递特性可有效避免滑丝，安装时需使用梅花槽专用批头配合电动工具。",
    descZhTw:
      "槽型呈六角梅花狀防滑設計，廣泛用於手機金屬中框精密裝配、新能源汽車充電樁外殼固定、設備控制櫃內部結構鎖緊以及高檔家具板材連接，利用梅花槽的高扭矩傳遞特性可有效避免滑絲，安裝時需使用梅花槽專用批頭配合電動工具。",
    descMs:
      "Pemacu Torx enam lobus anti-gelincir untuk pemasangan bingkai logam telefon pintar, pengencangan penutup stesen pengecasan EV, penguncian dalaman kabinet kawalan, dan sambungan panel perabot mewah. Pemindahan tork tinggi mencegah cam-out; memerlukan bit Torx dengan alat berkuasa.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture7.png"],
  },
  {
    sku: "SC-012",
    categoryId: 4,
    nameEn: "Phillips Self-Tapping Screw with Washer",
    nameZh: "十字槽带垫自攻钉螺丝",
    nameZhTw: "十字槽帶墊自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Philips dengan Palam Skru",
    descEn:
      "Integrated flat washer distributes clamping force for steel panel lap joints, roofing purlin-to-deck connections, thin metal sheet fastening, and wall beam-to-panel fixing. Drive directly with a Phillips bit or hex socket.",
    descZh:
      "头部带有一体化平垫圈可分散压紧力，主要用于两块彩钢板之间的搭接固定、屋顶檩条与屋面板连接、金属薄板件锁紧以及墙梁与面板的紧固，安装时直接使用十字批头或六角套筒旋入即可。",
    descZhTw:
      "頭部帶有一體化平墊圈可分散壓緊力，主要用於兩塊彩鋼板之間的搭接固定、屋頂檩條與屋面板連接、金屬薄板件鎖緊以及牆梁與面板的緊固，安裝時直接使用十字批頭或六角套筒旋入即可。",
    descMs:
      "Penyemat rata bersepadu mengedarkan daya pengapit untuk sambungan bertindih panel keluli, sambungan gelegar bumbung ke dek, pengencangan kepingan logam nipis, dan pengikat rasuk dinding ke panel. Pasang terus dengan bit Philips atau soket hex.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture8.png"],
  },
  {
    sku: "SC-013",
    categoryId: 4,
    nameEn: "Countersunk Self-Tapping Screw",
    nameZh: "沉头自攻钉螺丝",
    nameZhTw: "沉頭自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Kepala Tenggelam Skru",
    descEn:
      "Conical head design for wardrobe panel assembly, cabinet hardware installation, distribution box panel fixing, and automotive interior sheet metal fastening. Pre-drill a countersink matching the head diameter so the head sits flush; cone angle is typically 90° or 82°.",
    descZh:
      "头部锥形设计，适用于衣柜板材拼接、橱柜五金件安装、配电箱面板固定以及汽车内饰钣金件锁紧，安装时需先钻与头部直径一致的沉孔使钉头完全沉入工件表面不凸出，锥面角度通常为90°或82°。",
    descZhTw:
      "頭部錐形設計，適用於衣櫃板材拼接、廚櫃五金件安裝、配電箱面板固定以及汽車內飾鈑金件鎖緊，安裝時需先鑽與頭部直徑一致的沉孔使釘頭完全沉入工件表面不凸出，錐面角度通常為90°或82°。",
    descMs:
      "Rekaan kepala kon untuk pemasangan panel almari, pemasangan perkakasan kabinet, penetapan panel kotak pengagihan, dan pengencangan kepingan logam trim dalaman automotif. Gerudi lubang tenggelam yang sepadan dengan diameter kepala supaya kepala rata; sudut kon biasanya 90° atau 82°.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture9.png"],
  },
  {
    sku: "SC-014",
    categoryId: 4,
    nameEn: "Torx Self-Tapping Screw with Washer",
    nameZh: "梅花槽带垫自攻钉螺丝",
    nameZhTw: "梅花槽帶墊自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Torx dengan Palam Skru",
    descEn:
      "Combines Torx anti-slip drive with an integrated washer for furniture assembly, carpentry structural work, and ceiling joist fixing in architectural decoration. Install with a matching Torx bit.",
    descZh:
      "结合梅花槽防滑驱动与一体式垫圈的优点，主要用于连接桌椅柜体等家具、木工结构加工以及建筑装饰工程的吊顶龙骨固定，安装时使用梅花匹配批头拧紧即可。",
    descZhTw:
      "結合梅花槽防滑驅動與一體式墊圈的優點，主要用於連接桌椅櫃體等家具、木工結構加工以及建築裝飾工程的吊頂龍骨固定，安裝時使用梅花匹配批頭擰緊即可。",
    descMs:
      "Menggabungkan pemacu anti-gelincir Torx dengan penyemat bersepadu untuk pemasangan perabot, kerja struktur pertukangan, dan penetapan kerangka siling dalam kerja hiasan bangunan. Pasang dengan bit Torx yang sepadan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture10.png"],
  },
  {
    sku: "SC-015",
    categoryId: 4,
    nameEn: "Pin-in Torx Self-Tapping Screw",
    nameZh: "梅花槽带柱自攻钉螺丝",
    nameZhTw: "梅花槽帶柱自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Torx Tahan Gangguan Skru",
    descEn:
      "Center pin prevents standard tool engagement; requires a hollow Torx socket for installation. Designed for tamper-proof applications: street lamp enclosures, traffic signal boxes, utility meters, security equipment, and high-end machinery anti-disassembly.",
    descZh:
      "槽中心带有防拆圆柱设计，需使用带中心通孔的专用梅花套筒才能安装，广泛用于路灯外壳防盗固定、交通信号灯箱防护、电表箱与安防设备以及高端机械设备的防拆螺丝应用场合。",
    descZhTw:
      "槽中心帶有防拆圓柱設計，需使用帶中心通孔的專用梅花套筒才能安裝，廣泛用於路燈外殼防盜固定、交通信號燈箱防護、電錶箱與安防設備以及高端機械設備的防拆螺絲應用場合。",
    descMs:
      "Pin tengah menghalang penglibatan alat standard; memerlukan soket Torx berlubang untuk pemasangan. Direka untuk aplikasi tahan gangguan: penutup lampu jalan, kotak isyarat trafik, meter utiliti, peralatan keselamatan, dan perlindungan jentera mewah.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture11.png"],
  },
  {
    sku: "SC-016",
    categoryId: 4,
    nameEn: "Pozidriv Self-Tapping Screw",
    nameZh: "米字槽自攻钉螺丝",
    nameZhTw: "米字槽自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Pozidriv Skru",
    descEn:
      "Eight-contact Pozidriv drive for smart appliance enclosures, EV charging station waterproof housings, building curtain wall panel joining, and thin sheet metal penetration. Handles higher torque than Phillips with less cam-out; must use a P-type or PH-type Pozidriv bit at low speed.",
    descZh:
      "槽型类似汉字「米」字，拥有对称的八爪结构接触受力面，主要应用于智能家电外壳装配、新能源汽车充电桩防水壳固定、建筑幕墙拼接以及薄铁皮板件穿透，比传统十字槽能承受更大扭力且不易打滑，必须使用P型或PH型米字批头配合低速电钻安装。",
    descZhTw:
      "槽型類似漢字「米」字，擁有對稱的八爪結構接觸受力面，主要應用於智能家電外殼裝配、新能源汽車充電樁防水殼固定、建築幕牆拼接以及薄鐵皮板件穿透，比傳統十字槽能承受更大扭力且不易打滑，必須使用P型或PH型米字批頭配合低速電鑽安裝。",
    descMs:
      "Pemacu Pozidriv lapan sentuhan untuk penutup peralatan pintar, penutup kalis air stesen pengecasan EV, penyambungan panel dinding tirai bangunan, dan penembusan kepingan logam nipis. Menahan tork lebih tinggi daripada Philips dengan cam-out lebih sedikit; mesti menggunakan bit Pozidriv jenis P atau PH pada kelajuan rendah.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture12.png"],
  },
  {
    sku: "SC-017",
    categoryId: 4,
    nameEn: "Slotted Self-Tapping Screw",
    nameZh: "一字槽自攻钉螺丝",
    nameZhTw: "一字槽自攻釘螺絲",
    nameMs: "Skru Tapping Sendiri Berlekuk Skru",
    descEn:
      "Single straight slot for vintage furniture repair, small wood craft making, baseboard basic fixing, and retro equipment parts replacement. Suited for manual low-torque operation without power tools.",
    descZh:
      "头部有一条贯穿凹槽，常见于老式家具维修复刻、小型木质手工品制作、踢脚线基础固定以及怀旧设备零部件的原汁原味装配，适用于无电动工具仅需手动低扭矩操作的场景。",
    descZhTw:
      "頭部有一條貫穿凹槽，常見於老式家具維修復刻、小型木質手工品製作、踢腳線基礎固定以及懷舊設備零部件的原汁原味裝配，適用於無電動工具僅需手動低扭矩操作的場景。",
    descMs:
      "Celah lurus tunggal untuk pembaikan perabot vintaj, pembuatan kraftangan kayu kecil, penetapan asas papan skirting, dan penggantian bahagian peralatan retro. Sesuai untuk operasi tork rendah manual tanpa alat berkuasa.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture13.png"],
  },
  {
    sku: "SC-018",
    categoryId: 4,
    nameEn: "Square Drive Screw",
    nameZh: "内四方螺钉螺丝",
    nameZhTw: "內四方螺釘螺絲",
    nameMs: "Skru Pemacu Segi Empat Skru",
    descEn:
      "Square socket recess requires a Robertson driver; inherently tamper-resistant. Used in railway construction, automotive component fastening, road and bridge infrastructure, and anti-tamper panel fixing for electrical facilities.",
    descZh:
      "头部呈方形凹坑结构，需使用内四方专用工具操作，具有防盗防拆卸特性，主要用于铁路建设、汽车设备部件锁紧、道路桥梁设施紧固以及电力设施防拆卸面板固定。",
    descZhTw:
      "頭部呈方形凹坑結構，需使用內四方專用工具操作，具有防盜防拆卸特性，主要用於鐵路建設、汽車設備部件鎖緊、道路橋梁設施緊固以及電力設施防拆卸面板固定。",
    descMs:
      "Ceruk soket segi empat memerlukan pemacu Robertson; tahan gangguan secara semula jadi. Digunakan dalam pembinaan landasan kereta api, pengencangan komponen automotif, infrastruktur jalan dan jambatan, dan penetapan panel anti-gangguan untuk kemudahan elektrik.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture14.png"],
  },
  {
    sku: "SC-019",
    categoryId: 4,
    nameEn: "Torx Machine Screw",
    nameZh: "梅花槽机螺钉螺丝",
    nameZhTw: "梅花槽機螺釘螺絲",
    nameMs: "Skru Mesin Torx Skru",
    descEn:
      "Torx drive machine thread fastener for high-speed rail interior fitting, automotive sensor and control module assembly, precision instrument positioning, and PCB enclosure fastening. Torx bit prevents slipping for precise, reliable installation.",
    descZh:
      "驱动槽为梅花形设计的机械牙螺钉，主要应用于高铁车厢内饰件固定、汽车内部传感器及控制模块装配、精密仪器仪表定位以及电子电路板外壳锁紧，搭配梅花槽专用批头可有效防止滑动提高安装精度。",
    descZhTw:
      "驅動槽為梅花形設計的機械牙螺釘，主要應用於高鐵車廂內飾件固定、汽車內部傳感器及控制模組裝配、精密儀器儀表定位以及電子電路板外殼鎖緊，搭配梅花槽專用批頭可有效防止滑動提高安裝精度。",
    descMs:
      "Pengikat benang mesin pemacu Torx untuk pemasangan trim dalaman kereta api berkelajuan tinggi, pemasangan penderia automotif dan modul kawalan, penempatan instrumen presisi, dan pengencangan penutup PCB. Bit Torx mencegah gelinciran untuk pemasangan yang tepat dan boleh dipercayai.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture15.png"],
  },
  {
    sku: "SC-020",
    categoryId: 4,
    nameEn: "Phillips Machine Screw with Washer",
    nameZh: "十字槽带垫螺丝",
    nameZhTw: "十字槽帶墊螺絲",
    nameMs: "Skru Mesin Philips dengan Palam Skru",
    descEn:
      "Machine thread with integrated flat washer for home appliance panel fixing, electronic chassis assembly, precision instrument component fastening, and automation equipment motor enclosure installation. Phillips drive with combination washer ensures reliable anti-loosening after tightening.",
    descZh:
      "机械牙类型配合一体化平垫的设计，广泛用于家用电器面板固定、电子设备机箱组装、仪器仪表精密部件锁紧以及自动化设备电机外壳安装，十字驱动搭配组合垫圈确保锁紧后防松效果良好。",
    descZhTw:
      "機械牙類型配合一體化平墊的設計，廣泛用於家用電器面板固定、電子設備機箱組裝、儀器儀表精密部件鎖緊以及自動化設備電機外殼安裝，十字驅動搭配組合墊圈確保鎖緊後防鬆效果良好。",
    descMs:
      "Benang mesin dengan penyemat rata bersepadu untuk penetapan panel peralatan rumah, pemasangan casis elektronik, pengencangan komponen instrumen presisi, dan pemasangan penutup motor peralatan automasi. Pemacu Philips dengan penyemat gabungan memastikan kesan anti-longgar yang baik selepas pengencangan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture16.png"],
  },
  {
    sku: "SC-021",
    categoryId: 4,
    nameEn: "Phillips Self-Drilling Screw",
    nameZh: "十字槽钻尾螺丝",
    nameZhTw: "十字槽鑽尾螺絲",
    nameMs: "Skru Gerudi Sendiri Philips Skru",
    descEn:
      "Self-drilling tip combines drilling, tapping, and fastening in one step. Used for metal filing cabinet assembly, thin steel purlin fixing, aluminum window frame installation, and light steel framing drywall systems. No pre-drilling required.",
    descZh:
      "尾部自带钻头尖部设计，从钻孔、攻丝到锁紧三步动作一次性完成，常用于金属文件柜组装、薄钢板檩条固定、铝合金门窗门框安装以及轻钢龙骨石膏板系统的快速干壁作业，无需预钻底孔即可直接旋入。",
    descZhTw:
      "尾部自帶鑽頭尖部設計，從鑽孔、攻絲到鎖緊三步動作一次性完成，常用於金屬文件櫃組裝、薄鋼板檩條固定、鋁合金門窗門框安裝以及輕鋼龍骨石膏板系統的快速乾牆作業，無需預鑽底孔即可直接旋入。",
    descMs:
      "Hujung gerudi sendiri menggabungkan penggerudian, pengetapan, dan pengencangan dalam satu langkah. Digunakan untuk pemasangan kabinet fail logam, penetapan gelegar keluli nipis, pemasangan bingkai tingkap aluminium, dan sistem drywall rangka keluli ringan. Tiada pra-gerudi diperlukan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture17.png"],
  },
  {
    sku: "SC-022",
    categoryId: 4,
    nameEn: "Hex Head Self-Drilling Screw",
    nameZh: "六角头钻尾螺丝",
    nameZhTw: "六角頭鑽尾螺絲",
    nameMs: "Skru Gerudi Sendiri Kepala Hex Skru",
    descEn:
      "Hex head with flange for steel structure color-coated roof panels, large warehouse wall purlin connections, prefabricated building thin sheet assembly, and light advertisement board metal frame fastening. Use a socket wrench or hex socket with drill for one-step drilling and fastening.",
    descZh:
      "头部为六角形并配有法兰面的一体化钻尾组件，主要应用于工厂钢结构彩钢瓦屋顶固定、大型仓库墙面檩条连接、简易活动房薄铁皮装配以及轻型广告牌金属框架锁紧，安装时使用套筒扳手或电钻配合六角套筒一次完成钻孔与锁紧。",
    descZhTw:
      "頭部為六角形並配有法蘭面的一體化鑽尾組件，主要應用於工廠鋼結構彩鋼瓦屋頂固定、大型倉庫牆面檩條連接、簡易活動房薄鐵皮裝配以及輕型廣告牌金屬框架鎖緊，安裝時使用套筒扳手或電鑽配合六角套筒一次完成鑽孔與鎖緊。",
    descMs:
      "Kepala hex dengan flange untuk panel bumbung berwarna struktur keluli, sambungan gelegar dinding gudang besar, pemasangan kepingan nipis bangunan prafabrikasi, dan pengencangan rangka logam papan iklan ringan. Gunakan sepana soket atau soket hex dengan gerudi untuk penggerudian dan pengencangan satu langkah.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture18.png"],
  },
  {
    sku: "SC-023",
    categoryId: 4,
    nameEn: "Slotted Machine Screw",
    nameZh: "一字槽机螺钉螺丝",
    nameZhTw: "一字槽機螺釘螺絲",
    nameMs: "Skru Mesin Berlekuk Skru",
    descEn:
      "Single straight slot machine thread fastener for shipbuilding interior component fixing, automotive chassis parts assembly, machine tool guard fastening, and corrosion-resistant connections on offshore platforms in harsh environments. Drive with a matching flat-head screwdriver.",
    descZh:
      "开一字槽的机械牙紧固件，广泛用于船舶制造舱内部件固定、汽车底盘零部件装配、机械加工设备防护盖锁紧以及海洋平台设备在恶劣腐蚀环境下的耐锈连接，使用时使用配套一字螺丝刀旋入即可。",
    descZhTw:
      "開一字槽的機械牙緊固件，廣泛用於船舶製造艙內部件固定、汽車底盤零部件裝配、機械加工設備防護蓋鎖緊以及海洋平台設備在惡劣腐蝕環境下的耐鏽連接，使用時使用配套一字螺絲刀旋入即可。",
    descMs:
      "Pengikat benang mesin celah lurus tunggal untuk penetapan komponen dalaman pembuatan kapal, pemasangan bahagian casis automotif, pengencangan penutup penjaga mesin, dan sambungan tahan karat pada platform luar pesisir dalam persekitaran yang keras. Pasang dengan pemutar skru kepala rata yang sepadan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture19.png"],
  },
  {
    sku: "SC-024",
    categoryId: 4,
    nameEn: "Hex Socket Self-Drilling Screw",
    nameZh: "内六角钻尾螺丝",
    nameZhTw: "內六角鑽尾螺絲",
    nameMs: "Skru Gerudi Sendiri Soket Hex Skru",
    descEn:
      "Hex socket recess with self-drilling tip for building curtain wall framing, guardrail post and embedded part connections, steel structure ridge batten fixing, and container home thin panel fastening. Use a hex socket with drill for one-pass drilling, tapping, and fastening.",
    descZh:
      "部内六角凹槽配合尾部自钻结构，广泛用于建筑幕墙骨架固定、护栏支柱与预埋件连接、钢结构屋脊瓦条固定以及集装箱房薄板材锁紧，安装时使用内六角套筒搭配电钻一次性完成钻孔攻丝与锁固全流程。",
    descZhTw:
      "部內六角凹槽配合尾部自鑽結構，廣泛用於建築幕牆骨架固定、護欄支柱與預埋件連接、鋼結構屋脊瓦條固定以及集裝箱房薄板材鎖緊，安裝時使用內六角套筒搭配電鑽一次性完成鑽孔攻絲與鎖固全流程。",
    descMs:
      "Ceruk soket hex dengan hujung gerudi sendiri untuk rangka dinding tirai bangunan, sambungan tiang gelandar dan bahagian terbenam, penetapan batten rabung struktur keluli, dan pengencangan panel nipis rumah kontena. Gunakan soket hex dengan gerudi untuk penggerudian, pengetapan, dan pengencangan dalam satu laluan.",
    specs: {},
    price: "0.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/SC/Picture20.png"],
  },
  {
    sku: "SC-025",
    categoryId: 4,
    nameEn: "Deli Torx T10 Screwdriver with Hole 100mm DL6210010T",
    nameZh: "得力中孔花型螺丝批T10*100mm DL6210010T",
    nameZhTw: "得力中孔花型螺絲批T10*100mm DL6210010T",
    nameMs: "Pemutar Skru Torx T10 Berlubang Deli 100mm DL6210010T",
    descEn:
      "Commonly used for disassembling mobile phones, tablets, game controllers, and some home appliances. Before use, ensure the magnetic tip can hold the screw. Align the T10 star tip with the centre hole of the screw head, press firmly and rotate vertically to complete assembly or disassembly.",
    descZh:
      "常用于拆修手机、平板、游戏手柄及部分家电（如小尺寸电器设备），使用前确保批头磁吸能吸住螺丝，将批头对准螺丝头部的星形中孔，顶住后垂直旋转即可完成拆装。",
    descZhTw:
      "常用於拆修手機、平板、遊戲手柄及部分家電（如小尺寸電器設備），使用前確保批頭磁吸能吸住螺絲，將批頭對準螺絲頭部的星形中孔，頂住後垂直旋轉即可完成拆裝。",
    descMs:
      "Biasa digunakan untuk membuka telefon pintar, tablet, pengawal permainan, dan beberapa peralatan elektrik rumah. Sebelum digunakan, pastikan hujung bermagnet boleh memegang skru. Selaraskan hujung bintang T10 dengan lubang tengah kepala skru, tekan dengan kuat dan putar menegak untuk menyelesaikan pemasangan atau pembongkaran.",
    specs: {
      Size: "T10",
      Length: "100mm",
      Model: "DL6210010T",
      Type: "Torx Screwdriver with Centre Hole",
    },
    price: "3.50",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/SC/21.png"],
  },
  {
    sku: "SC-026",
    categoryId: 4,
    nameEn: "Deli Flush Cutter Pliers 5-inch DL2715",
    nameZh: "得力水口钳5寸 DL2715",
    nameZhTw: "得力水口鉗5寸 DL2715",
    nameMs: "Playar Pemotong Rata Deli 5 inci DL2715",
    descEn:
      "Widely used for trimming injection-moulded part gates and burrs, cutting model runner channels, trimming PCB component leads, and cutting plastic cable ties. Press both handles together to cut. Not suitable for cutting iron wire or steel wire.",
    descZh:
      "普遍用于注塑件修剪水口毛刺、模型零件流道剪切、电路板元件引脚修理及日常剪电线塑料绑带，手压两钳柄进行剪切操作即可，注意该钳不适用于剪铁丝及钢丝。",
    descZhTw:
      "普遍用於注塑件修剪水口毛刺、模型零件流道剪切、電路板元件引腳修理及日常剪電線塑料綁帶，手壓兩鉗柄進行剪切操作即可，注意該鉗不適用於剪鐵絲及鋼絲。",
    descMs:
      "Digunakan meluas untuk memangkas gate dan gerembolan bahagian acuan suntikan, memotong saluran lari komponen model, membaiki pin komponen PCB, dan memotong pengikat plastik. Tekan kedua pemegang untuk memotong. Tidak sesuai untuk memotong wayar besi atau wayar keluli.",
    specs: { Size: "5 inch", Model: "DL2715", Type: "Flush Cutter Pliers" },
    price: "16.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/SC/22.png"],
  },
  {
    sku: "SC-027",
    categoryId: 4,
    nameEn: "Chaowei Wooden Handle Mechanic Hammer 0.3kg",
    nameZh: "超威木柄钳工锤0.3kg",
    nameZhTw: "超威木柄鉗工錘0.3kg",
    nameMs: "Tukul Mekanik Pemegang Kayu Chaowei 0.3kg",
    descEn:
      "Mainly used for driving nails during furniture assembly, reshaping sheet metal, and light striking tasks in door and window repairs. Hold the exposed end of the wooden handle; ensure the hammer face is parallel to the workpiece when striking.",
    descZh:
      "主要用于家具安装钉钉子、钣金归位整形及门窗维修等小敲击作业，握住木柄尾端露出部分，落锤时保证锤面和工件平行。",
    descZhTw:
      "主要用於家具安裝釘釘子、鈑金歸位整形及門窗維修等小敲擊作業，握住木柄尾端露出部分，落錘時保證錘面和工件平行。",
    descMs:
      "Terutamanya digunakan untuk memaku semasa pemasangan perabot, membentuk semula kepingan logam, dan tugas ketukan ringan dalam pembaikan pintu dan tingkap. Pegang hujung yang terdedah pada pemegang kayu; pastikan muka tukul selari dengan benda kerja semasa memukul.",
    specs: { Weight: "0.3kg", HandleMaterial: "Wood", Type: "Mechanic Hammer" },
    price: "6.00",
    stock: 300,
    images: ["https://productstupian.zhenda.store/uploads/SC/23.png"],
  },
  {
    sku: "SC-028",
    categoryId: 4,
    nameEn: "Chaowei Wooden Handle Mason Hammer 1250g",
    nameZh: "超威普通木柄石工锤1250g",
    nameZhTw: "超威普通木柄石工錘1250g",
    nameMs: "Tukul Tukang Batu Pemegang Kayu Biasa Chaowei 1250g",
    descEn:
      "Suitable for demolishing lightweight brick walls, chiselling stone, removing ceramic tiles, and assembling or dismantling construction formwork. When used with a steel chisel or cold chisel, hold the front of the wooden handle with both hands to improve impact force.",
    descZh:
      "适用于破拆轻质砖墙、石料开凿、瓷砖铲除及建筑模板拆装，配合钢钎或錾子使用时需要双手握持木柄前端以提高冲击力。",
    descZhTw:
      "適用於破拆輕質磚牆、石料開鑿、瓷磚鏟除及建築模板拆裝，配合鋼釺或鑿子使用時需要雙手握持木柄前端以提高衝擊力。",
    descMs:
      "Sesuai untuk merobohkan dinding bata ringan, memahat batu, menanggalkan jubin seramik, dan memasang atau membongkar acuan pembinaan. Apabila digunakan bersama pahat besi atau pahat sejuk, pegang bahagian depan pemegang kayu dengan kedua tangan untuk meningkatkan daya hentaman.",
    specs: { Weight: "1250g", HandleMaterial: "Wood", Type: "Mason Hammer" },
    price: "10.00",
    stock: 200,
    images: ["https://productstupian.zhenda.store/uploads/SC/24.png"],
  },
  {
    sku: "DS-001",
    categoryId: 5,
    nameEn: "Tongsuo 6-Outlet 5-Pin Power Strip TS-6261 (Wireless)",
    nameZh: "同硕移动式插座六位五孔TS-6261（无线）",
    nameZhTw: "同碩移動式插座六位五孔TS-6261（無線）",
    nameMs: "Papan Soket Mudah Alih 6-Lubang Tongsuo TS-6261 (Tanpa Wayar)",
    descEn:
      "Suitable for office or home use to simultaneously connect 6 two/three-pin devices such as computers, monitors, and routers. A power cord with plug must be provided separately. Total load must not exceed 2500W.",
    descZh:
      "适用于办公室、家庭同时连接电脑、显示器、路由器等6个两/三插设备，选择时需自行配接带插头的电源线，注意总功率不超过2500W。",
    descZhTw:
      "適用於辦公室、家庭同時連接電腦、顯示器、路由器等6個兩/三插設備，選擇時需自行配接帶插頭的電源線，注意總功率不超過2500W。",
    descMs:
      "Sesuai untuk pejabat dan rumah untuk menghubungkan 6 peranti dua/tiga-pin seperti komputer, monitor, dan penghala secara serentak. Kord kuasa dengan plag mesti disediakan sendiri. Jumlah beban tidak melebihi 2500W.",
    specs: {
      Outlets: "6 (5-pin)",
      MaxLoad: "2500W",
      Type: "Wireless Extension",
    },
    price: "27.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/richang/1.png"],
  },
  {
    sku: "DS-002",
    categoryId: 5,
    nameEn: "Tongsuo 3+3 Outlet Power Strip TS-6262 (Wireless)",
    nameZh: "同硕移动式插座三位五孔+三位两孔TS-6262（无线）",
    nameZhTw: "同碩移動式插座三位五孔+三位兩孔TS-6262（無線）",
    nameMs: "Papan Soket Mudah Alih 3+3 Lubang Tongsuo TS-6262 (Tanpa Wayar)",
    descEn:
      "Ideal for TV cabinets or kitchen counters mixing three-pin appliances and two-pin small electronics. Choose based on the ratio of plug types needed; the wireless version allows flexible cable length to suit actual routing.",
    descZh:
      "适合电视柜或厨房台面混合使用三插电器与两插小家电，选择时根据插头类型占比决定，无线版本便于按实际走线长度接缆。",
    descZhTw:
      "適合電視櫃或廚房台面混合使用三插電器與兩插小家電，選擇時根據插頭類型占比決定，無線版本便於按實際走線長度接纜。",
    descMs:
      "Sesuai untuk kabinet TV atau permukaan dapur yang menggabungkan peralatan tiga-pin dan elektronik kecil dua-pin. Pilih berdasarkan nisbah jenis plag; versi tanpa wayar memudahkan penjalanan kabel mengikut kepanjangan sebenar.",
    specs: {
      Outlets: "3×5-pin + 3×2-pin",
      MaxLoad: "2500W",
      Type: "Wireless Extension",
    },
    price: "24.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/richang/2.png"],
  },
  {
    sku: "DS-003",
    categoryId: 5,
    nameEn: "Tongsuo High-Power Single 16A Outlet TS-8111-K (Wireless)",
    nameZh: "同硕大功率移动式插座一位16A TS-8111-K（无线）",
    nameZhTw: "同碩大功率移動式插座一位16A TS-8111-K（無線）",
    nameMs: "Soket Berkuasa Tinggi 16A Tunggal Tongsuo TS-8111-K (Tanpa Wayar)",
    descEn:
      "Designed specifically for 16A plug devices such as air conditioners, water heaters, and high-power industrial fans. Verify the device plug is 16A (wider blade than 10A) and that the circuit can handle a load below 4000W.",
    descZh:
      "专为空调、热水器、大功率工业风扇等16A插头设备设计，选择时确认设备插头为16A（较10A插片宽厚），且线路能承载4000W以下负载。",
    descZhTw:
      "專為空調、熱水器、大功率工業風扇等16A插頭設備設計，選擇時確認設備插頭為16A（較10A插片寬厚），且線路能承載4000W以下負載。",
    descMs:
      "Direka khas untuk peranti plag 16A seperti penghawa dingin, pemanas air, dan kipas industri berkuasa tinggi. Sahkan plag peranti ialah 16A (bilah lebih lebar daripada 10A) dan pastikan litar mampu menanggung beban di bawah 4000W.",
    specs: { Outlets: "1 (16A)", MaxLoad: "4000W", Type: "Wireless Extension" },
    price: "11.00",
    stock: 500,
    images: ["https://productstupian.zhenda.store/uploads/richang/3.png"],
  },
  {
    sku: "DS-004",
    categoryId: 5,
    nameEn: "Tongsuo Washing Machine Faucet TS-KS05",
    nameZh: "同硕洗衣机龙头TS-KS05",
    nameZhTw: "同碩洗衣機龍頭TS-KS05",
    nameMs: "Pili Mesin Basuh Tongsuo TS-KS05",
    descEn:
      "Connects a washing machine inlet hose to a 4-point threaded wall water outlet. Verify the home water pipe has a 4-point male thread, and confirm the faucet has a quick-lock adapter compatible with standard washing machine hose connectors.",
    descZh:
      "用于连接洗衣机进水管与墙面4分螺纹出水口，选择时先量测家中水管接口为4分外螺纹，并确认龙头带有快速卡扣适配洗衣机通用管接头。",
    descZhTw:
      "用於連接洗衣機進水管與牆面4分螺紋出水口，選擇時先量測家中水管接口為4分外螺紋，並確認龍頭帶有快速卡扣適配洗衣機通用管接頭。",
    descMs:
      "Menghubungkan hos masuk mesin basuh ke salur keluar air dinding berulir 4-poin. Sahkan paip rumah mempunyai ulir jantan 4-poin, dan pastikan pili mempunyai penyambung cepat yang serasi dengan penyambung hos mesin basuh standard.",
    specs: { Thread: '4-point (1/2")', Type: "Washing Machine Faucet" },
    price: "2.50",
    stock: 800,
    images: ["https://productstupian.zhenda.store/uploads/richang/4.png"],
  },
  {
    sku: "DS-005",
    categoryId: 5,
    nameEn: "Tongsuo Surface-Mount 2-Gang Single-Control Switch M1-121",
    nameZh: "同硕明装二位单控开关M1-121",
    nameZhTw: "同碩明裝二位單控開關M1-121",
    nameMs: "Suis Kawalan Tunggal 2-Gang Permukaan Tongsuo M1-121",
    descEn:
      "For surface mounting on finished walls to control two lights or two circuits independently. Single-control means one switch controls one fixture. Choose based on the number of lights to control and the surface-mount box position.",
    descZh:
      "适合在已装修墙面明装控制两盏灯或两个回路，选择时根据控制灯的数量和明装底盒位置，单控适用于一个开关只控制一个灯具的场景。",
    descZhTw:
      "適合在已裝修牆面明裝控制兩盞燈或兩個回路，選擇時根據控制燈的數量和明裝底盒位置，單控適用於一個開關只控制一個燈具的場景。",
    descMs:
      "Untuk pemasangan permukaan pada dinding siap bagi mengawal dua lampu atau dua litar secara bebas. Kawalan tunggal bermakna satu suis mengawal satu armatur. Pilih berdasarkan bilangan lampu dan kedudukan kotak permukaan.",
    specs: { Gangs: "2", Control: "Single", Type: "Surface-Mount Switch" },
    price: "9.00",
    stock: 600,
    images: ["https://productstupian.zhenda.store/uploads/richang/5.png"],
  },
  {
    sku: "DS-006",
    categoryId: 5,
    nameEn: "Tongsuo Surface-Mount 10A Dual 3-Pin Socket M1-205",
    nameZh: "同硕明装10A二三极插座M1-205",
    nameZhTw: "同碩明裝10A二三極插座M1-205",
    nameMs: "Soket 3-Pin 10A Permukaan Tongsuo M1-205",
    descEn:
      "Adds a five-pin socket (10A) for surface wiring on walls, suitable for low-power appliances such as desk lamps and chargers. Confirm that a 16A large socket is not required and that the mounting surface is flat.",
    descZh:
      "用于墙壁明线走线时增加一个五孔插座（10A），适用于小功率家电如台灯、充电器，选择时确认不需要16A大孔且安装面平整。",
    descZhTw:
      "用於牆壁明線走線時增加一個五孔插座（10A），適用於小功率家電如台燈、充電器，選擇時確認不需要16A大孔且安裝面平整。",
    descMs:
      "Menambah soket lima-lubang (10A) untuk pendawaian permukaan dinding, sesuai untuk peralatan berkuasa rendah seperti lampu meja dan pengecas. Sahkan soket 16A tidak diperlukan dan permukaan pemasangan adalah rata.",
    specs: {
      Rating: "10A",
      Outlets: "1 (5-pin)",
      Type: "Surface-Mount Socket",
    },
    price: "6.00",
    stock: 600,
    images: ["https://productstupian.zhenda.store/uploads/richang/6.png"],
  },
  {
    sku: "DS-007",
    categoryId: 5,
    nameEn: "Tongsuo Surface-Mount 2-Gang 3-Pin Socket M1-207",
    nameZh: "同硕明装二位二扁三极插座M1-207",
    nameZhTw: "同碩明裝二位二扁三極插座M1-207",
    nameMs: "Soket 3-Pin 2-Gang Permukaan Tongsuo M1-207",
    descEn:
      "Connects two three-pin devices simultaneously such as a refrigerator and a rice cooker. Total load must not exceed 2500W. Surface-mount design requires no wall chiselling.",
    descZh:
      "适合同时连接两台三插设备（如冰箱+电饭煲），选择时注意总负载不超过2500W，明装设计无需凿墙。",
    descZhTw:
      "適合同時連接兩台三插設備（如冰箱+電飯煲），選擇時注意總負載不超過2500W，明裝設計無需鑿牆。",
    descMs:
      "Menghubungkan dua peranti tiga-pin serentak seperti peti sejuk dan periuk nasi. Jumlah beban tidak melebihi 2500W. Rekaan permukaan tidak memerlukan kerja memahat dinding.",
    specs: {
      Gangs: "2",
      Rating: "10A",
      MaxLoad: "2500W",
      Type: "Surface-Mount Socket",
    },
    price: "9.00",
    stock: 600,
    images: ["https://productstupian.zhenda.store/uploads/richang/7.png"],
  },
  {
    sku: "DS-008",
    categoryId: 5,
    nameEn: "Jinho Double-Lock Steel Tape Measure 5m×19mm JH-22A",
    nameZh: "金虎双闸电镀钢卷尺5米*19 JH-22A",
    nameZhTw: "金虎雙閘電鍍鋼捲尺5米*19 JH-22A",
    nameMs: "Pita Pengukur Keluli Berkunci Ganda Jinho 5m×19mm JH-22A",
    descEn:
      "Suitable for home renovation, furniture measurement, and construction site layout. The 5-metre length covers general room dimensions; the 19mm blade width ensures rigidity. Double-lock brake for convenient locking at any position.",
    descZh:
      "适用于家庭装修、家具测量、工地放样，选择5米长度可满足一般房间尺寸测量，19mm尺带宽度保证挺直度，双闸制动方便锁紧。",
    descZhTw:
      "適用於家庭裝修、家具測量、工地放樣，選擇5米長度可滿足一般房間尺寸測量，19mm尺帶寬度保證挺直度，雙閘制動方便鎖緊。",
    descMs:
      "Sesuai untuk pengubahsuaian rumah, pengukuran perabot, dan penanda tapak pembinaan. Panjang 5 meter mencukupi untuk ukuran bilik umum; lebar pita 19mm memastikan ketegaran. Brek kunci ganda untuk penguncian mudah di mana-mana kedudukan.",
    specs: { Length: "5m", BladeWidth: "19mm", Type: "Steel Tape Measure" },
    price: "5.00",
    stock: 800,
    images: ["https://productstupian.zhenda.store/uploads/richang/8.png"],
  },
  {
    sku: "DS-009",
    categoryId: 5,
    nameEn: "Hengshen Heavy-Duty Brass-Finish Padlock 38mm",
    nameZh: "恒申厚体仿铜挂锁38/364",
    nameZhTw: "恒申厚體仿銅掛鎖38/364",
    nameMs: "Mangga Berbadan Tebal Bersalut Loyang Hengshen 38mm",
    descEn:
      "For general anti-theft use on toolboxes, dormitory cabinet doors, and outdoor small gates. The 38mm body balances portability and shear resistance; brass finish provides good rust resistance. Keep keys in a safe place.",
    descZh:
      "用于工具箱、宿舍柜门、户外小门等普通防盗场合，选择38mm锁体尺寸兼顾便携与防剪性，仿铜材质防锈较好，钥匙需妥善保管。",
    descZhTw:
      "用於工具箱、宿舍櫃門、戶外小門等普通防盜場合，選擇38mm鎖體尺寸兼顧便攜與防剪性，仿銅材質防鏽較好，鑰匙需妥善保管。",
    descMs:
      "Untuk kegunaan anti-kecurian biasa pada kotak alat, pintu kabinet asrama, dan pintu kecil luar. Badan 38mm mengimbangi mudah alih dan rintangan potongan; salutan loyang memberikan rintangan karat yang baik. Simpan kunci di tempat selamat.",
    specs: { BodySize: "38mm", Material: "Brass-Finish", Type: "Padlock" },
    price: "4.50",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/richang/9.png"],
  },
  {
    sku: "DS-010",
    categoryId: 5,
    nameEn: "Chaomei KN95 Foldable Ear-Loop Mask 6001-C",
    nameZh: "朝美KN95折叠耳挂式口罩6001-C",
    nameZhTw: "朝美KN95折疊耳掛式口罩6001-C",
    nameMs: "Topeng Muka KN95 Boleh Lipat Gelung Telinga Chaomei 6001-C",
    descEn:
      "Suitable for industrial dust protection, hazy days, or daily protection during flu season. KN95 rating ensures filtration efficiency ≥95%. Foldable for easy carrying; ear-loop style for comfortable short-term wear. Pack: 600 pcs/carton, 50 pcs/box.",
    descZh:
      "适用于工业防尘、雾霾天或流感季日常防护，选择KN95等级确保过滤效率≥95%，折叠式便于携带，耳挂式适合短时间佩戴。型号：6001-C 过滤等级：KN95。包装参数：600只/箱，50只/盒。",
    descZhTw:
      "適用於工業防塵、霧霾天或流感季日常防護，選擇KN95等級確保過濾效率≥95%，折疊式便於攜帶，耳掛式適合短時間佩戴。型號：6001-C 過濾等級：KN95。包裝參數：600只/箱，50只/盒。",
    descMs:
      "Sesuai untuk perlindungan habuk industri, hari jerebu, atau perlindungan harian semasa musim selesema. Penarafan KN95 memastikan kecekapan penapisan ≥95%. Boleh dilipat untuk mudah dibawa; gelung telinga sesuai untuk pemakaian jangka pendek yang selesa. Pembungkusan: 600 pcs/kotak, 50 pcs/kotak kecil.",
    specs: {
      Rating: "KN95",
      Filtration: "≥95%",
      Style: "Ear-loop Foldable",
      Pack: "50 pcs/box",
    },
    price: "0.90",
    stock: 5000,
    images: ["https://productstupian.zhenda.store/uploads/richang/10.png"],
  },
  {
    sku: "DS-011",
    categoryId: 5,
    nameEn: "Qingsong EVA Disposable Raincoat 1088-100 Blue",
    nameZh: "青松EVA一次性雨衣1088-100蓝色",
    nameZhTw: "青松EVA一次性雨衣1088-100藍色",
    nameMs: "Jas Hujan Pakai Buang EVA Qingsong 1088-100 Biru",
    descEn:
      "Suitable for temporary rain protection at scenic spots, exhibitions, and construction sites. PEVA material is soft and odour-free; one size fits most body types. Disposable — discard after use. Pack: 150 pcs/carton.",
    descZh:
      "适合景区、展会、工地等临时防雨场景，选择EVA材质柔软无味，均码可覆盖多数体型，一次性使用后即可丢弃。材质：PEVA料 尺码：均码。包装参数：150件/箱。",
    descZhTw:
      "適合景區、展會、工地等臨時防雨場景，選擇EVA材質柔軟無味，均碼可覆蓋多數體型，一次性使用後即可丟棄。材質：PEVA料 尺碼：均碼。包裝參數：150件/箱。",
    descMs:
      "Sesuai untuk perlindungan hujan sementara di kawasan pelancongan, pameran, dan tapak pembinaan. Bahan PEVA lembut dan tidak berbau; saiz universal memuatkan kebanyakan saiz badan. Guna-buang — buang selepas digunakan. Pembungkusan: 150 pcs/kotan.",
    specs: {
      Material: "PEVA",
      Size: "Universal",
      Color: "Blue",
      Pack: "150 pcs/carton",
    },
    price: "5.00",
    stock: 1000,
    images: ["https://productstupian.zhenda.store/uploads/richang/11.png"],
  },
];

async function seed() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log("Seeding categories...");
  for (const c of categorySeed) {
    await conn.execute(
      `INSERT INTO categories (slug, nameEn, nameZh, nameZhTw, nameMs, descEn, descZh, descZhTw, descMs, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nameEn=VALUES(nameEn)`,
      [
        c.slug,
        c.nameEn,
        c.nameZh,
        c.nameZhTw,
        c.nameMs,
        c.descEn,
        c.descZh,
        c.descZhTw,
        c.descMs,
        c.sortOrder,
      ]
    );
  }

  console.log("Seeding products...");
  for (const p of productSeed) {
    await conn.execute(
      `INSERT INTO products (sku, categoryId, nameEn, nameZh, nameZhTw, nameMs, descEn, descZh, descZhTw, descMs, specs, price, stock, images, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nameEn=VALUES(nameEn), nameZh=VALUES(nameZh), nameZhTw=VALUES(nameZhTw), nameMs=VALUES(nameMs), descEn=VALUES(descEn), descZh=VALUES(descZh), descZhTw=VALUES(descZhTw), descMs=VALUES(descMs), specs=VALUES(specs), price=VALUES(price), stock=VALUES(stock), images=VALUES(images)`,
      [
        p.sku,
        p.categoryId,
        p.nameEn,
        p.nameZh,
        p.nameZhTw,
        p.nameMs,
        p.descEn,
        p.descZh,
        p.descZhTw,
        p.descMs,
        JSON.stringify(p.specs),
        p.price,
        p.stock,
        JSON.stringify(p.images ?? []),
        true,
      ]
    );
  }

  console.log("Seed complete!");
  await conn.end();
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
