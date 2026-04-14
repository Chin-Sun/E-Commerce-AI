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
      `INSERT INTO products (sku, categoryId, nameEn, nameZh, nameZhTw, nameMs, descEn, descZh, descZhTw, descMs, specs, price, stock, images, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nameEn=VALUES(nameEn)`,
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
        JSON.stringify([]),
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
