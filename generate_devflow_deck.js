const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Kelompok DevFlow — Universitas Pamulang";
pres.title = "DevFlow: Sistem Onboarding Developer & Pemantauan Utang Teknis Berbasis Cloud";

// ═══════════════════════════════════════════════════════
// DESIGN SYSTEM — Dark Slate + Emerald Corporate Theme
// ═══════════════════════════════════════════════════════
const C = {
  bgDeep:    "0F172A",  // slate-900
  bgCard:    "1E293B",  // slate-800
  bgCard2:   "334155",  // slate-700
  border:    "475569",  // slate-600
  emerald:   "10B981",  // primary accent
  emeraldDk: "059669",  // darker emerald
  blue:      "3B82F6",  // secondary accent
  cyan:      "06B6D4",  // tertiary
  white:     "F1F5F9",  // slate-100
  gray:      "94A3B8",  // slate-400
  grayDk:    "64748B",  // slate-500
  grayDkr:   "475569",  // slate-600
  red:       "EF4444",
  amber:     "F59E0B",
  amberDk:   "D97706",
};

const FH = "Calibri";   // Header (clean sans-serif, universal)
const FB = "Calibri";   // Body

// Helpers — fresh objects each call (pptxgenjs mutates)
const mkShadow = () => ({ type: "outer", blur: 10, offset: 3, color: "000000", opacity: 0.35 });
const mkSoft   = () => ({ type: "outer", blur: 5, offset: 1, color: "000000", opacity: 0.20 });

// ═══════════════════════════════════════════════════════
// MASTER — Shared footer & top bar
// ═══════════════════════════════════════════════════════
pres.defineSlideMaster({
  title: "MAIN",
  background: { color: C.bgDeep },
  objects: [
    // Top emerald hairline
    { rect: { x: 0, y: 0, w: 10, h: 0.045, fill: { color: C.emerald } } },
    // Footer bar
    { rect: { x: 0, y: 5.35, w: 10, h: 0.275, fill: { color: C.bgCard } } },
    { text: { text: "Universitas Pamulang  ·  Manajemen Proyek Informatika  ·  2026", options: { x: 0.5, y: 5.37, w: 7, h: 0.23, fontSize: 8, fontFace: FB, color: C.grayDk } } },
    { text: { text: "{slideNumber} / 8", options: { x: 8.5, y: 5.37, w: 1, h: 0.23, fontSize: 8, fontFace: FB, color: C.grayDk, align: "right" } } },
  ],
});

// ═══════════════════════════════════════════════════════
// SLIDE 1 — JUDUL UTAMA
// ═══════════════════════════════════════════════════════
let s1 = pres.addSlide({ masterName: "MAIN" });

// Subtle geometric accent
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.emerald } });
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.045, fill: { color: C.emerald } });

// Course label
s1.addText("TUGAS MATA KULIAH MANAJEMEN PROYEK INFORMATIKA", {
  x: 0.7, y: 0.6, w: 8.5, h: 0.3,
  fontSize: 10, fontFace: FB, color: C.emerald, bold: true, charSpacing: 4, margin: 0,
});

// Main title
s1.addText("DevFlow", {
  x: 0.7, y: 1.2, w: 8.5, h: 0.9,
  fontSize: 56, fontFace: FH, color: C.white, bold: true, margin: 0,
});
s1.addText("Sistem Onboarding Developer &\nPemantauan Utang Teknis Berbasis Cloud", {
  x: 0.7, y: 2.1, w: 8, h: 0.8,
  fontSize: 20, fontFace: FB, color: C.gray, margin: 0,
});

// Divider line
s1.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.15, w: 2.5, h: 0.04, fill: { color: C.emerald } });

// Team info
s1.addText("Universitas Pamulang — Fakultas Teknik — Teknik Informatika", {
  x: 0.7, y: 3.5, w: 8, h: 0.3,
  fontSize: 12, fontFace: FB, color: C.grayDk, margin: 0,
});

// Member names (placeholder - user should fill in)
s1.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.0, w: 5, h: 1.0, fill: { color: C.bgCard }, shadow: mkSoft() });
s1.addText("ANGGOTA KELOMPOK", {
  x: 0.9, y: 4.1, w: 4, h: 0.2,
  fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0,
});
s1.addText([
  { text: "1. Andika Arya Pratama", options: { breakLine: true } },
  { text: "2. [Nama Anggota 2]", options: { breakLine: true } },
  { text: "3. [Nama Anggota 3]", options: { breakLine: true } },
  { text: "4. [Nama Anggota 4]" },
], { x: 0.9, y: 4.35, w: 4, h: 0.6, fontSize: 11, fontFace: FB, color: C.white, margin: 0 });

// Logo placeholder instruction
s1.addShape(pres.shapes.RECTANGLE, { x: 7.8, y: 3.8, w: 1.5, h: 1.5, fill: { color: C.bgCard }, shadow: mkSoft() });
s1.addText("LOGO\nUNPAM", {
  x: 7.8, y: 3.8, w: 1.5, h: 1.5,
  fontSize: 11, fontFace: FB, color: C.grayDk, align: "center", valign: "middle", bold: true, margin: 0,
});


// ═══════════════════════════════════════════════════════
// SLIDE 2 — LATAR BELAKANG & IDENTIFIKASI MASALAH
// ═══════════════════════════════════════════════════════
let s2 = pres.addSlide({ masterName: "MAIN" });

s2.addText("SLIDE 02", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s2.addText("Latar Belakang & Identifikasi Masalah", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

// Three problem cards
const problems = [
  {
    icon: "⚠",
    iconColor: C.amber,
    title: "Onboarding yang Lambat",
    desc: "Developer baru membutuhkan waktu lama untuk memahami environment, tools, dan workflow tim karena dokumentasi tersebar di berbagai platform.",
    stat: "~2 Minggu",
    statLabel: "Rata-rata waktu onboarding tanpa sistem terpusat",
  },
  {
    icon: "⚠",
    iconColor: C.red,
    title: "Standar Kode Tidak Terpusat",
    desc: "Tidak ada single source of truth untuk coding standards. Setiap developer mengikuti konvensi yang berbeda, menyebabkan inkonsistensi kualitas kode.",
    stat: "0%",
    statLabel: "Compliance tracking yang terukur secara otomatis",
  },
  {
    icon: "⚠",
    iconColor: C.red,
    title: "Penumpukan Technical Debt",
    desc: "Tanpa mekanisme pemantauan, hutang teknis menumpuk secara diam-diam hingga menjadi masalah kritis yang menghambat delivery.",
    stat: "Tidak Terukur",
    statLabel: "Visibilitas PM terhadap beban teknis tim",
  },
];

problems.forEach((p, i) => {
  const x = 0.5 + i * 3.1;
  // Card
  s2.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.55, w: 2.9, h: 3.5, fill: { color: C.bgCard }, shadow: mkShadow() });
  // Top accent
  s2.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.55, w: 2.9, h: 0.06, fill: { color: p.iconColor } });
  // Icon
  s2.addText(p.icon, { x: x + 0.2, y: 1.8, w: 0.5, h: 0.5, fontSize: 24, color: p.iconColor, margin: 0 });
  // Title
  s2.addText(p.title, { x: x + 0.2, y: 2.35, w: 2.5, h: 0.35, fontSize: 14, fontFace: FH, color: C.white, bold: true, margin: 0 });
  // Description
  s2.addText(p.desc, { x: x + 0.2, y: 2.8, w: 2.5, h: 1.2, fontSize: 11, fontFace: FB, color: C.gray, margin: 0 });
  // Stat callout
  s2.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: 4.1, w: 2.5, h: 0.7, fill: { color: C.bgDeep } });
  s2.addText(p.stat, { x: x + 0.2, y: 4.1, w: 2.5, h: 0.35, fontSize: 16, fontFace: FH, color: p.iconColor, bold: true, align: "center", valign: "middle", margin: 0 });
  s2.addText(p.statLabel, { x: x + 0.2, y: 4.45, w: 2.5, h: 0.3, fontSize: 8, fontFace: FB, color: C.grayDk, align: "center", margin: 0 });
});


// ═══════════════════════════════════════════════════════
// SLIDE 3 — SOLUSI: DEVFLOW
// ═══════════════════════════════════════════════════════
let s3 = pres.addSlide({ masterName: "MAIN" });

s3.addText("SLIDE 03", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s3.addText("Solusi yang Ditawarkan: DevFlow", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

// Tagline
s3.addText("Platform Cloud-Native untuk Manajemen Onboarding & Monitoring Technical Health secara Real-Time.", {
  x: 0.5, y: 1.3, w: 9, h: 0.35, fontSize: 13, fontFace: FB, color: C.emerald, italic: true, margin: 0,
});

// Left column — Core capabilities
s3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.9, w: 4.5, h: 3.2, fill: { color: C.bgCard }, shadow: mkShadow() });
s3.addText("KAPABILITAS INTI", { x: 0.7, y: 2.05, w: 4, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });

const caps = [
  { t: "Dynamic Checklist Management", d: "PM mengelola task onboarding langsung dari UI tanpa deployment ulang." },
  { t: "Real-Time Synchronization", d: "Perubahan data tersinkronisasi ke seluruh klien dalam hitungan milidetik via Firestore." },
  { t: "Role-Based Access Control", d: "Pemisahan hak akses tegas antara Admin/PM dan Developer." },
  { t: "Live Analytics Dashboard", d: "Metrik performa tim dihitung otomatis dari data aktual, bukan dummy." },
];

caps.forEach((cap, i) => {
  const y = 2.5 + i * 0.65;
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: y, w: 0.06, h: 0.45, fill: { color: C.emerald } });
  s3.addText(cap.t, { x: 0.95, y: y, w: 3.8, h: 0.2, fontSize: 12, fontFace: FH, color: C.white, bold: true, margin: 0 });
  s3.addText(cap.d, { x: 0.95, y: y + 0.22, w: 3.8, h: 0.2, fontSize: 10, fontFace: FB, color: C.gray, margin: 0 });
});

// Right column — Key differentiator
s3.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.9, w: 4.2, h: 3.2, fill: { color: C.bgCard }, shadow: mkShadow() });
s3.addText("PEMBEDA UTAMA", { x: 5.5, y: 2.05, w: 3.8, h: 0.25, fontSize: 8, fontFace: FB, color: C.blue, bold: true, charSpacing: 3, margin: 0 });

const diffs = [
  { metric: "< 50ms", label: "Latensi sinkronisasi data antar klien" },
  { metric: "100%", label: "Data dashboard diambil dari database aktual" },
  { metric: "2 Role", label: "Segregasi akses Admin vs Developer" },
  { metric: "Rp 0", label: "Biaya infrastruktur di tier gratis Firebase" },
];

diffs.forEach((d, i) => {
  const y = 2.5 + i * 0.65;
  s3.addText(d.metric, { x: 5.5, y: y, w: 1.2, h: 0.45, fontSize: 18, fontFace: FH, color: C.emerald, bold: true, valign: "middle", margin: 0 });
  s3.addText(d.label, { x: 6.8, y: y, w: 2.5, h: 0.45, fontSize: 11, fontFace: FB, color: C.gray, valign: "middle", margin: 0 });
});


// ═══════════════════════════════════════════════════════
// SLIDE 4 — ARSITEKTUR & TECH STACK
// ═══════════════════════════════════════════════════════
let s4 = pres.addSlide({ masterName: "MAIN" });

s4.addText("SLIDE 04", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s4.addText("Arsitektur Sistem & Technology Stack", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

// Architecture diagram — 3 connected boxes
// Box 1: Frontend
s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.6, w: 2.6, h: 2.0, fill: { color: C.bgCard }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.6, w: 2.6, h: 0.06, fill: { color: C.blue } });
s4.addText("FRONTEND", { x: 0.5, y: 1.8, w: 2.6, h: 0.25, fontSize: 8, fontFace: FB, color: C.blue, bold: true, align: "center", charSpacing: 3, margin: 0 });
s4.addText("Next.js 15", { x: 0.5, y: 2.15, w: 2.6, h: 0.3, fontSize: 18, fontFace: FH, color: C.white, bold: true, align: "center", margin: 0 });
s4.addText([
  { text: "React 19 + App Router", options: { breakLine: true } },
  { text: "Tailwind CSS 3", options: { breakLine: true } },
  { text: "TypeScript", options: { breakLine: true } },
  { text: "Lucide Icons" },
], { x: 0.7, y: 2.6, w: 2.2, h: 0.8, fontSize: 10, fontFace: FB, color: C.gray, align: "center", margin: 0 });

// Arrow 1
s4.addText("◄──►", { x: 3.1, y: 2.3, w: 0.8, h: 0.4, fontSize: 14, fontFace: FB, color: C.emerald, align: "center", valign: "middle", margin: 0 });

// Box 2: Auth
s4.addShape(pres.shapes.RECTANGLE, { x: 3.7, y: 1.6, w: 2.6, h: 2.0, fill: { color: C.bgCard }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 3.7, y: 1.6, w: 2.6, h: 0.06, fill: { color: C.emerald } });
s4.addText("KEAMANAN", { x: 3.7, y: 1.8, w: 2.6, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, align: "center", charSpacing: 3, margin: 0 });
s4.addText("Firebase Auth", { x: 3.7, y: 2.15, w: 2.6, h: 0.3, fontSize: 18, fontFace: FH, color: C.white, bold: true, align: "center", margin: 0 });
s4.addText([
  { text: "Google OAuth 2.0", options: { breakLine: true } },
  { text: "Role-Based Access", options: { breakLine: true } },
  { text: "Session Management", options: { breakLine: true } },
  { text: "Admin Email Guard" },
], { x: 3.9, y: 2.6, w: 2.2, h: 0.8, fontSize: 10, fontFace: FB, color: C.gray, align: "center", margin: 0 });

// Arrow 2
s4.addText("◄──►", { x: 6.3, y: 2.3, w: 0.8, h: 0.4, fontSize: 14, fontFace: FB, color: C.emerald, align: "center", valign: "middle", margin: 0 });

// Box 3: Database
s4.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 1.6, w: 2.6, h: 2.0, fill: { color: C.bgCard }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 1.6, w: 2.6, h: 0.06, fill: { color: C.cyan } });
s4.addText("DATABASE", { x: 6.9, y: 1.8, w: 2.6, h: 0.25, fontSize: 8, fontFace: FB, color: C.cyan, bold: true, align: "center", charSpacing: 3, margin: 0 });
s4.addText("Firestore", { x: 6.9, y: 2.15, w: 2.6, h: 0.3, fontSize: 18, fontFace: FH, color: C.white, bold: true, align: "center", margin: 0 });
s4.addText([
  { text: "NoSQL Document DB", options: { breakLine: true } },
  { text: "Real-time Listeners", options: { breakLine: true } },
  { text: "onSnapshot() Protocol", options: { breakLine: true } },
  { text: "Server Timestamps" },
], { x: 7.1, y: 2.6, w: 2.2, h: 0.8, fontSize: 10, fontFace: FB, color: C.gray, align: "center", margin: 0 });

// Data flow label
s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.0, w: 9, h: 1.0, fill: { color: C.bgCard } });
s4.addText("ALUR DATA", { x: 0.7, y: 4.1, w: 2, h: 0.2, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s4.addText("User Login → Firebase Auth memvalidasi identitas → Firestore menyimpan role (admin/developer) → Aplikasi melakukan redirect berdasarkan role → Real-time listener mendorong perubahan data ke semua klien yang terhubung secara paralel tanpa refresh.", {
  x: 0.7, y: 4.35, w: 8.5, h: 0.5, fontSize: 11, fontFace: FB, color: C.gray, margin: 0,
});


// ═══════════════════════════════════════════════════════
// SLIDE 5 — WORK BREAKDOWN STRUCTURE (WBS)
// ═══════════════════════════════════════════════════════
let s5 = pres.addSlide({ masterName: "MAIN" });

s5.addText("SLIDE 05", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s5.addText("Work Breakdown Structure (WBS)", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

const phases = [
  {
    num: "01", name: "INITIATION", color: C.blue, duration: "Minggu 1-2",
    tasks: [
      "Identifikasi kebutuhan stakeholder",
      "Analisis masalah onboarding & tech debt",
      "Penyusunan project charter",
    ]
  },
  {
    num: "02", name: "PLANNING", color: C.emerald, duration: "Minggu 3-4",
    tasks: [
      "Perancangan arsitektur sistem",
      "Pemilihan tech stack (Next.js + Firebase)",
      "Desain database schema Firestore",
      "Pembuatan wireframe UI/UX",
    ]
  },
  {
    num: "03", name: "EXECUTION", color: C.amber, duration: "Minggu 5-10",
    tasks: [
      "Implementasi Firebase Auth + RBAC",
      "Pengembangan CRUD Checklist dinamis",
      "Integrasi real-time dashboard analytics",
      "Pengembangan Team Progress Monitoring",
    ]
  },
  {
    num: "04", name: "CLOSING", color: C.cyan, duration: "Minggu 11-12",
    tasks: [
      "User Acceptance Testing (UAT)",
      "Dokumentasi teknis & user guide",
      "Deployment ke production",
    ]
  },
];

phases.forEach((ph, i) => {
  const x = 0.5 + i * 2.35;
  // Phase card
  s5.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.45, w: 2.15, h: 3.7, fill: { color: C.bgCard }, shadow: mkShadow() });
  s5.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.45, w: 2.15, h: 0.06, fill: { color: ph.color } });

  // Phase number circle
  s5.addShape(pres.shapes.OVAL, { x: x + 0.7, y: 1.65, w: 0.7, h: 0.7, fill: { color: ph.color, transparency: 80 } });
  s5.addText(ph.num, { x: x + 0.7, y: 1.65, w: 0.7, h: 0.7, fontSize: 18, fontFace: FH, color: ph.color, bold: true, align: "center", valign: "middle", margin: 0 });

  // Phase name
  s5.addText(ph.name, { x: x + 0.1, y: 2.5, w: 1.95, h: 0.25, fontSize: 10, fontFace: FH, color: ph.color, bold: true, align: "center", charSpacing: 3, margin: 0 });

  // Duration
  s5.addText(ph.duration, { x: x + 0.1, y: 2.8, w: 1.95, h: 0.2, fontSize: 9, fontFace: FB, color: C.grayDk, align: "center", margin: 0 });

  // Divider
  s5.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 3.1, w: 1.55, h: 0.02, fill: { color: C.grayDkr } });

  // Tasks
  s5.addText(
    ph.tasks.map((t, ti) => ({ text: t, options: { bullet: true, breakLine: ti < ph.tasks.length - 1, fontSize: 10, color: C.gray } })),
    { x: x + 0.15, y: 3.25, w: 1.85, h: 1.7, fontFace: FB, paraSpaceAfter: 5, margin: 0 }
  );

  // Connector arrow
  if (i < phases.length - 1) {
    s5.addText("→", { x: x + 2.12, y: 2.8, w: 0.3, h: 0.4, fontSize: 18, fontFace: FB, color: C.grayDkr, align: "center", valign: "middle", margin: 0 });
  }
});


// ═══════════════════════════════════════════════════════
// SLIDE 6 — RENCANA ANGGARAN BIAYA (OpEx)
// ═══════════════════════════════════════════════════════
let s6 = pres.addSlide({ masterName: "MAIN" });

s6.addText("SLIDE 06", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s6.addText("Rencana Anggaran Biaya (OpEx)", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});
s6.addText("Model Pay-as-you-go Firebase: Biaya skala berdasarkan penggunaan aktual.", {
  x: 0.5, y: 1.2, w: 9, h: 0.3, fontSize: 12, fontFace: FB, color: C.gray, italic: true, margin: 0,
});

// Budget table
const tblHeader = [
  { text: "Komponen", options: { fill: { color: C.emeraldDk }, color: C.white, bold: true, fontSize: 12, fontFace: FH, align: "left" } },
  { text: "Layanan", options: { fill: { color: C.emeraldDk }, color: C.white, bold: true, fontSize: 12, fontFace: FH, align: "center" } },
  { text: "Model Biaya", options: { fill: { color: C.emeraldDk }, color: C.white, bold: true, fontSize: 12, fontFace: FH, align: "center" } },
  { text: "Estimasi/Bulan", options: { fill: { color: C.emeraldDk }, color: C.white, bold: true, fontSize: 12, fontFace: FH, align: "right" } },
];

const mkRow = (bg) => (comp, layanan, model, biaya) => [
  { text: comp, options: { fill: { color: bg }, color: C.white, fontSize: 11, fontFace: FB, align: "left" } },
  { text: layanan, options: { fill: { color: bg }, color: C.gray, fontSize: 11, fontFace: FB, align: "center" } },
  { text: model, options: { fill: { color: bg }, color: C.gray, fontSize: 11, fontFace: FB, align: "center" } },
  { text: biaya, options: { fill: { color: bg }, color: C.emerald, fontSize: 11, fontFace: FH, bold: true, align: "right" } },
];

const row1 = mkRow(C.bgCard);
const row2 = mkRow(C.bgCard2);

const tblData = [
  tblHeader,
  row1("Hosting", "Vercel (Hobby)", "Gratis", "Rp 0"),
  row2("Database", "Firebase Firestore", "Pay-as-you-go", "Rp 0*"),
  row1("Autentikasi", "Firebase Auth", "Gratis (< 10K user)", "Rp 0"),
  row2("Domain (Opsional)", "Custom Domain", "Tahunan", "Rp 100.000"),
  row1("SSL Certificate", "Cloudflare / Vercel", "Gratis", "Rp 0"),
];

s6.addTable(tblData, {
  x: 0.5, y: 1.7, w: 9,
  colW: [2.2, 2.3, 2.3, 2.2],
  rowH: 0.4,
  border: { pt: 0.5, color: C.grayDkr },
});

// Total callout
s6.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.85, w: 4, h: 0.9, fill: { color: C.bgCard }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.85, w: 0.07, h: 0.9, fill: { color: C.emerald } });
s6.addText("TOTAL ESTIMASI OPERASIONAL", { x: 5.75, y: 3.9, w: 3.5, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 2, margin: 0 });
s6.addText("Rp 100.000 /bulan", { x: 5.75, y: 4.2, w: 3.5, h: 0.4, fontSize: 22, fontFace: FH, color: C.white, bold: true, margin: 0 });

// Footnote
s6.addText("*Firestore Spark Plan menyediakan 1 GB storage + 50K reads/day gratis — cukup untuk skala tim 10-50 orang.", {
  x: 0.5, y: 4.85, w: 9, h: 0.25, fontSize: 9, fontFace: FB, color: C.grayDk, italic: true, margin: 0,
});


// ═══════════════════════════════════════════════════════
// SLIDE 7 — MANAJEMEN RISIKO & PENGUJIAN
// ═══════════════════════════════════════════════════════
let s7 = pres.addSlide({ masterName: "MAIN" });

s7.addText("SLIDE 07", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s7.addText("Manajemen Risiko & Pengujian", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

// Left: Risk Table
s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.4, w: 4.5, h: 3.7, fill: { color: C.bgCard }, shadow: mkShadow() });
s7.addText("IDENTIFIKASI RISIKO & MITIGASI", { x: 0.7, y: 1.55, w: 4, h: 0.25, fontSize: 8, fontFace: FB, color: C.red, bold: true, charSpacing: 2, margin: 0 });

const risks = [
  { risk: "Akses tidak sah ke Dashboard PM", level: "HIGH", mitigation: "Implementasi RBAC: rute /dashboard & /team di-hidden dari sidebar Developer.", color: C.red },
  { risk: "Data integrity saat CRUD paralel", level: "MED", mitigation: "Firestore Transaction & Server Timestamps menjamin konsistensi data.", color: C.amber },
  { risk: "Vendor lock-in Firebase", level: "LOW", mitigation: "Arsitektur modular memungkinkan migrasi ke Supabase/AWS jika diperlukan.", color: C.emerald },
];

risks.forEach((r, i) => {
  const y = 2.0 + i * 1.05;
  // Risk level badge
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: y, w: 0.8, h: 0.3, fill: { color: r.color, transparency: 80 } });
  s7.addText(r.level, { x: 0.7, y: y, w: 0.8, h: 0.3, fontSize: 8, fontFace: FH, color: r.color, bold: true, align: "center", valign: "middle", margin: 0 });
  // Risk description
  s7.addText(r.risk, { x: 1.65, y: y, w: 3.2, h: 0.3, fontSize: 11, fontFace: FH, color: C.white, bold: true, margin: 0 });
  // Mitigation
  s7.addText(r.mitigation, { x: 1.65, y: y + 0.35, w: 3.2, h: 0.5, fontSize: 10, fontFace: FB, color: C.gray, margin: 0 });
});

// Right: Testing Results
s7.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.4, w: 4.2, h: 3.7, fill: { color: C.bgCard }, shadow: mkShadow() });
s7.addText("HASIL PENGUJIAN", { x: 5.5, y: 1.55, w: 3.8, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 2, margin: 0 });

const tests = [
  { name: "Login & Redirect RBAC", status: "PASS", detail: "Admin → /dashboard, Dev → /checklist" },
  { name: "CRUD Checklist Global", status: "PASS", detail: "Create, Edit, Delete tersinkronisasi" },
  { name: "Real-Time Telemetri", status: "PASS", detail: "Perubahan data < 50ms ke semua klien" },
  { name: "Team Progress Accuracy", status: "PASS", detail: "Persentase sesuai data aktual Firestore" },
  { name: "Role Segregation", status: "PASS", detail: "Developer tidak bisa akses rute Admin" },
];

tests.forEach((t, i) => {
  const y = 2.0 + i * 0.6;
  // Status badge
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: y, w: 0.7, h: 0.25, fill: { color: C.emerald, transparency: 80 } });
  s7.addText(t.status, { x: 5.5, y: y, w: 0.7, h: 0.25, fontSize: 8, fontFace: FH, color: C.emerald, bold: true, align: "center", valign: "middle", margin: 0 });
  // Test name
  s7.addText(t.name, { x: 6.35, y: y, w: 3, h: 0.25, fontSize: 11, fontFace: FH, color: C.white, bold: true, margin: 0 });
  // Detail
  s7.addText(t.detail, { x: 6.35, y: y + 0.25, w: 3, h: 0.2, fontSize: 9, fontFace: FB, color: C.grayDk, margin: 0 });
});


// ═══════════════════════════════════════════════════════
// SLIDE 8 — KESIMPULAN & PENUTUP
// ═══════════════════════════════════════════════════════
let s8 = pres.addSlide({ masterName: "MAIN" });

// Accent strip
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.emerald } });

s8.addText("SLIDE 08", { x: 0.5, y: 0.3, w: 2, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });
s8.addText("Kesimpulan & Penutup", {
  x: 0.5, y: 0.6, w: 9, h: 0.6, fontSize: 28, fontFace: FH, color: C.white, bold: true, margin: 0,
});

// Conclusion card
s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.4, w: 9, h: 1.8, fill: { color: C.bgCard }, shadow: mkShadow() });
s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.4, w: 0.07, h: 1.8, fill: { color: C.emerald } });
s8.addText("KESIMPULAN", { x: 0.8, y: 1.5, w: 8, h: 0.25, fontSize: 8, fontFace: FB, color: C.emerald, bold: true, charSpacing: 3, margin: 0 });

s8.addText([
  { text: "DevFlow berhasil dibangun sebagai solusi Cloud-Native yang mengeliminasi kebutuhan hardcoded tasks dan menyediakan single source of truth untuk seluruh tim.", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
  { text: "Implementasi RBAC dan real-time synchronization memastikan integritas data dan keamanan akses lintas peran organisasi.", options: { bullet: true, breakLine: true, fontSize: 12, color: C.white } },
  { text: "Dengan model Pay-as-you-go, sistem ini menekan biaya maintenance infrastruktur hingga mendekati nol pada skala tim kecil-menengah.", options: { bullet: true, fontSize: 12, color: C.white } },
], { x: 0.8, y: 1.85, w: 8.4, h: 1.2, fontFace: FB, paraSpaceAfter: 6, margin: 0 });

// Quote / closing statement
s8.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.5, w: 7, h: 0.9, fill: { color: C.bgCard2 } });
s8.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.5, w: 0.06, h: 0.9, fill: { color: C.emerald } });
s8.addText("\"DevFlow membuktikan bahwa dengan arsitektur Cloud-Native yang tepat, kompleksitas manajemen proyek dapat disederhanakan tanpa mengorbankan keandalan dan skalabilitas.\"", {
  x: 1.8, y: 3.55, w: 6.5, h: 0.8, fontSize: 13, fontFace: FB, color: C.gray, italic: true, valign: "middle", margin: 0,
});

// Q&A section
s8.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 4.55, w: 5, h: 0.04, fill: { color: C.emerald } });
s8.addText("Sesi Tanya Jawab", {
  x: 0, y: 4.7, w: 10, h: 0.4,
  fontSize: 18, fontFace: FH, color: C.white, bold: true, align: "center", margin: 0,
});

// ═══════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════
pres.writeFile({ fileName: "DevFlow_Presentasi_MPI.pptx" })
  .then(() => console.log("DONE! Saved: DevFlow_Presentasi_MPI.pptx"))
  .catch(err => console.error("Error:", err));
