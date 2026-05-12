"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Terminal, ShieldCheck, Activity,
  Zap, Plus, ArrowUpRight, Sparkles, ChevronRight, Code2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createProject } from "@/lib/project";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-hot-toast";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const dur = 1400;
          const start = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
          const step = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            if (el) el.textContent = Math.round(easeOut(p) * target).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Terminal typewriter ───────────────────────────────────────────────────────
const TERM_LINES = [
  { icon: "ok", content: <>Scanning <strong className="text-white">phoenix-engine</strong> repo…</> },
  { icon: "ok", content: <>Architecture compliance: <strong className="text-[#00FFA3]">98.2%</strong></> },
  { icon: "info", content: <>Technical debt: <span className="text-[#F472B6]">12 medium</span>, <span className="text-[#00FFA3]">2 low</span></> },
  { icon: "ok", content: <>Onboarding: <strong className="text-[#00FFA3]">14 / 14</strong> completed</> },
  { icon: "ok", content: <>CI pipeline: <span className="text-[#00FFA3]">passing</span> (last 24h)</> },
  { icon: "prompt", content: null },
];

function TerminalMockup() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      const interval = setInterval(() => {
        setVisible(v => {
          if (v >= TERM_LINES.length) { clearInterval(interval); return v; }
          return v + 1;
        });
      }, 520);
      return () => clearInterval(interval);
    }, 1600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="terminal max-w-[680px] mx-auto mb-24 rounded-[22px] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-[14px] border-b border-white/[0.055] bg-black/30">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="font-mono text-[11px] text-[#52526a] ml-2">devflow — health-check — phoenix-engine</span>
        <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(0,255,163,.07)] border border-[rgba(0,255,163,.18)] rounded-md font-mono text-[9px] text-[#00FFA3] font-bold tracking-widest uppercase">
          <span className="w-[5px] h-[5px] rounded-full bg-[#00FFA3] animate-[blink_1.2s_ease-in-out_infinite]" />
          LIVE
        </span>
      </div>
      <div className="p-8 font-mono text-[13px] leading-[2.1] text-left space-y-0">
        {TERM_LINES.map((line, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 transition-all duration-300 ${i < visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
          >
            {line.icon === "ok" && <span className="text-[#00FFA3]">✔</span>}
            {line.icon === "info" && <span className="text-[#38BDF8]">◈</span>}
            {line.icon === "prompt" && (
              <span className="text-[#52526a]">
                ${" "}<span className="inline-block w-2 h-3.5 bg-[#00FFA3] animate-[cursor-blink_1s_step-end_infinite] align-middle" />
              </span>
            )}
            {line.content && <span className="text-[#52526a]">{line.content}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reveal wrapper ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .75s ease ${delay}ms, transform .75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature card with 3D tilt ─────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, tag, title, desc, accent, delay,
}: {
  icon: any; tag: string; title: string; desc: string; accent: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    el.style.transform = `perspective(900px) rotateX(${dy * -7}deg) rotateY(${dx * 7}deg) translateZ(12px)`;
    el.style.boxShadow = `${-dx * 18}px ${dy * 18}px 56px rgba(0,0,0,.45)`;
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "";
    ref.current.style.boxShadow = "";
  }, []);

  return (
    <Reveal delay={delay} className="group">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative overflow-hidden p-9 rounded-3xl border border-white/[0.055] bg-[#0a0b11] transition-[border-color] duration-300 hover:border-white/[0.1]"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Accent glow */}
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-[64px] opacity-0 group-hover:opacity-[0.17] transition-opacity duration-500 pointer-events-none"
          style={{ background: accent }}
        />

        {/* Tag */}
        <span
          className="absolute top-8 right-8 font-mono text-[9px] font-bold tracking-[.12em] uppercase border rounded-[6px] px-2 py-[3px] opacity-0 group-hover:opacity-75 transition-opacity duration-300"
          style={{ color: accent, borderColor: accent + "38" }}
        >
          {tag}
        </span>

        {/* Icon */}
        <div
          className="relative overflow-hidden w-[52px] h-[52px] rounded-[14px] border border-white/[0.07] flex items-center justify-center mb-6"
          style={{ background: accent + "0f" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent" />
          <Icon size={22} color={accent} className="relative z-10" strokeWidth={1.7} />
        </div>

        <h3 className="font-display text-[22px] font-extrabold tracking-tight leading-none text-white mb-3">
          {title}
        </h3>
        <p className="text-[14px] leading-[1.72] text-[#52526a]">{desc}</p>

        <Link
          href={tag === "Onboarding" ? "/checklist" : tag === "Compliance" ? "/standards" : "/dashboard"}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold mt-7 hover:gap-3 transition-all duration-200 no-underline"
          style={{ color: accent }}
        >
          Learn more
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </Reveal>
  );
}

// ─── Magnetic button wrapper ───────────────────────────────────────────────────
function MagneticBtn({
  children, onClick, className = "", style = {}
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * 0.22;
    const dy = (e.clientY - r.top - r.height / 2) * 0.22;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rxRef = useRef(0), ryRef = useRef(0);
  const mxRef = useRef(0), myRef = useRef(0);

  // Particle canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Custom cursor
    const onMove = (e: MouseEvent) => {
      mxRef.current = e.clientX; myRef.current = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", onMove);

    const animRing = () => {
      rxRef.current += (mxRef.current - rxRef.current) * 0.12;
      ryRef.current += (myRef.current - ryRef.current) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rxRef.current + "px";
        ringRef.current.style.top = ryRef.current + "px";
      }
      requestAnimationFrame(animRing);
    };
    const raf = requestAnimationFrame(animRing);

    // Particle field
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.45 + 0.08,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cvs.width) p.vx *= -1;
        if (p.y < 0 || p.y > cvs.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Setelah login, modal tetap buka — user langsung lihat form create project
      toast.success("Signed in! Now create your workspace.");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Sign in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Tidak mungkin, tapi guard tetap ada
    if (!projectName.trim()) { toast.error("Project name is required"); return; }
    setIsCreating(true);
    try {
      const { projectId } = await createProject(projectName, projectDesc, user.uid);
      toast.success("Project created!");
      setIsModalOpen(false);
      router.push(`/dashboard?projectId=${projectId}`);
    } catch { toast.error("Failed to create project"); }
    finally { setIsCreating(false); }
  };

  const features = [
    { icon: Terminal, tag: "Onboarding", title: "Automated Checklists", desc: "Interactive onboarding workflows for zero-friction team scaling. Every new dev hits the ground running from day one.", accent: "#00FFA3", delay: 100 },
    { icon: ShieldCheck, tag: "Compliance", title: "Standards Enforcer", desc: "Enforce architectural guardrails, track technical-debt drift, and gate deploys on quality thresholds automatically.", accent: "#38BDF8", delay: 180 },
    { icon: Activity, tag: "Observability", title: "Live Project Health", desc: "Real-time metrics on team velocity, issue backlog, and codebase decay — all in one beautifully unified view.", accent: "#F472B6", delay: 260 },
  ];

  const stats = [
    { value: 3200, suffix: "+", label: "Projects Monitored" },
    { value: 98, suffix: "%", label: "Compliance Rate" },
    { value: 40, suffix: "%", label: "Faster Onboarding" },
    { value: 500, suffix: "+", label: "Engineering Teams" },
  ];

  const marqueeItems = [
    "Zero Technical Debt", "CI/CD Integration", "Real-time Monitoring",
    "Automated Onboarding", "Code Quality Gates", "Team Velocity Tracking",
    "Architectural Compliance", "Security Scanning", "Performance Metrics",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Onest:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

        *,*::before,*::after { box-sizing: border-box; }
        :root {
          --accent: #00FFA3;
          --accent2: #38BDF8;
          --accent3: #F472B6;
        }
        html { scroll-behavior: smooth; }
        body { cursor: none !important; }
        .font-display { font-family: 'Syne', sans-serif !important; }
        .font-mono    { font-family: 'JetBrains Mono', monospace !important; }

        .terminal {
          border: 1px solid rgba(255,255,255,.115);
          background: #0a0b11;
          box-shadow: 0 48px 110px rgba(0,0,0,.72), 0 0 0 1px rgba(255,255,255,.035) inset;
          position: relative;
        }
        .terminal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,163,.45), transparent);
        }

        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:.15} }
        @keyframes cursor-blink{ 0%,100%{opacity:1} 50%{opacity:0}   }
        @keyframes orbFloat    { 0%,100%{transform:translate(0,0)} 33%{transform:translate(26px,-16px)} 66%{transform:translate(-14px,22px)} }
        @keyframes pulse       { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }
        @keyframes mq          { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .mq-animate { animation: mq 28s linear infinite; }
        .gradient-text {
          background: linear-gradient(155deg, #fff 0%, #777 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-accent {
          background: linear-gradient(120deg, var(--accent) 0%, var(--accent2) 90%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-2 h-2 bg-[#00FFA3] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
      />
      <div
        ref={ringRef}
        className="fixed w-[34px] h-[34px] border border-[rgba(0,255,163,.35)] rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
      />

      {/* Backgrounds */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1] opacity-35" />
      <div
        className="fixed inset-0 pointer-events-none z-[2] opacity-[.022]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }}
      />
      {/* Glow orbs */}
      {[
        { sz: 720, bg: "rgba(0,255,163,.07)", top: "-220px", left: "-180px", dur: "14s" },
        { sz: 650, bg: "rgba(56,189,248,.065)", bottom: "-180px", right: "-120px", dur: "18s" },
        { sz: 400, bg: "rgba(244,114,182,.045)", top: "45%", left: "46%", dur: "11s" },
      ].map((o, i) => (
        <div key={i} className="fixed pointer-events-none z-[1] overflow-hidden inset-0">
          <div style={{
            position: "absolute", width: o.sz, height: o.sz, borderRadius: "50%",
            background: `radial-gradient(circle,${o.bg} 0%,transparent 70%)`,
            top: o.top, left: o.left, bottom: o.bottom as any, right: o.right as any,
            animation: `orbFloat ${o.dur} ease-in-out infinite ${i === 2 ? "3s" : ""}`,
          }} />
        </div>
      ))}

      <div className="relative z-10">
        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.055] backdrop-blur-[28px]" style={{ background: "rgba(3,4,10,.65)" }}>
          <div className="max-w-[1280px] mx-auto px-12 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline group">
              <div className="w-[38px] h-[38px] bg-[#00FFA3] rounded-[10px] flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-110" style={{ boxShadow: "0 0 24px rgba(0,255,163,.25)" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
                <Zap className="w-5 h-5 fill-black text-black relative z-10" />
              </div>
              <span className="font-display text-[18px] font-extrabold text-white tracking-[-0.035em]">DEVFLOW</span>
            </Link>
            <div className="flex items-center gap-1">
              {[
                { label: "Product", href: "#product" },
                { label: "Framework", href: "#framework" },
                { label: "Enterprise", href: "#enterprise" },
              ].map(item => (
                <Link key={item.label} href={item.href} className="px-4 py-2 text-[13px] font-medium text-[#52526a] hover:text-white hover:bg-white/5 rounded-[9px] transition-colors no-underline">
                  {item.label}
                </Link>
              ))}
              {user ? (
                <MagneticBtn
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00FFA3] text-black font-display font-extrabold text-[12px] rounded-xl transition-[box-shadow] hover:shadow-[0_0_44px_rgba(0,255,163,.35)]"
                >
                  <Plus size={15} /> New Project
                </MagneticBtn>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 bg-[#00FFA3] text-black font-display font-extrabold text-[12px] rounded-xl no-underline hover:shadow-[0_0_44px_rgba(0,255,163,.35)] transition-[box-shadow]">
                  Get Started <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <main className="max-w-[1280px] mx-auto px-12">
          <section id="product" className="pt-24 pb-20 text-center relative">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(0,255,163,.055)] border border-[rgba(0,255,163,.18)] rounded-full font-mono text-[10px] font-bold tracking-[.14em] uppercase text-[#00FFA3] mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" style={{ animation: "pulse 2s ease-in-out infinite" }} />
                Engineering Excellence Redefined
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="font-display font-extrabold leading-[.88] tracking-[-0.04em] mb-7" style={{ fontSize: "clamp(52px,9vw,116px)" }}>
                <span className="block gradient-text">Engineering</span>
                <span className="gradient-accent">Health</span> Control
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="max-w-[500px] mx-auto text-[17px] leading-[1.68] mb-11" style={{ color: "#5e5e78" }}>
                The unified control center for technical debt, developer onboarding,
                and architectural standards — built for teams that ship without compromise.
              </p>
            </Reveal>

            <Reveal delay={260} className="flex justify-center items-center gap-3 flex-wrap mb-20">
              <MagneticBtn
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2.5 px-8 py-4 bg-[#00FFA3] text-black font-display font-extrabold text-[14px] rounded-[14px] transition-[box-shadow] hover:shadow-[0_0_44px_rgba(0,255,163,.35),0_8px_32px_rgba(0,255,163,.18)]"
              >
                Launch New Project <ArrowRight size={16} />
              </MagneticBtn>
              <Link href="/dashboard" className="flex items-center gap-2.5 px-8 py-4 text-white border border-white/[0.115] rounded-[14px] font-display font-bold text-[14px] no-underline hover:border-white/25 hover:bg-white/[0.04] transition-all">
                Enter Dashboard <ChevronRight size={16} />
              </Link>
            </Reveal>

            <Reveal delay={340}>
              <TerminalMockup />
            </Reveal>
          </section>

          {/* ── STATS ── */}
          <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
            {stats.map((s, i) => (
              <div key={i} className="relative overflow-hidden p-7 rounded-[20px] border border-white/[0.055] bg-[#0a0b11] text-center hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(0,0,0,.5)] transition-all duration-300">
                <div className="absolute inset-[-1px] rounded-[20px] bg-gradient-to-br from-white/[0.035] to-transparent pointer-events-none" />
                <div className="font-display text-[46px] font-extrabold text-white leading-none mb-2">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="font-mono text-[9px] font-bold tracking-[.14em] uppercase text-[#52526a]">{s.label}</div>
              </div>
            ))}
          </Reveal>

          {/* ── MARQUEE ── */}
          <div className="relative overflow-hidden mb-28 py-7 border-t border-b border-white/[0.055]">
            <div className="absolute top-0 bottom-0 left-0 w-36 bg-gradient-to-r from-[#03040a] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-36 bg-gradient-to-l from-[#03040a] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-14 mq-animate w-max">
              {[...marqueeItems, ...marqueeItems].map((txt, i) => (
                <div key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-[10px] font-bold tracking-[.1em] uppercase text-[#52526a]">
                  {txt} <span className="w-1 h-1 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          {/* ── FEATURES ── */}
          <section id="framework" className="mb-28">
            <Reveal className="text-center mb-14">
              <div className="font-mono text-[9px] font-bold tracking-[.18em] uppercase text-[#52526a] mb-4">Core Platform</div>
              <h2 className="font-display font-extrabold tracking-tight leading-[1.05] gradient-text" style={{ fontSize: "clamp(30px,3.8vw,50px)" }}>
                Everything your team needs<br />to build with confidence
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {features.map((f) => <FeatureCard key={f.tag} {...f} />)}
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <Reveal>
            <section id="enterprise" className="mb-24 px-20 py-20 rounded-[32px] border border-white/[0.115] relative overflow-hidden flex items-center justify-between gap-12 flex-wrap transition-[border-color] duration-400 hover:border-[rgba(0,255,163,.18)]" style={{ background: "linear-gradient(140deg,rgba(0,255,163,.04) 0%,rgba(56,189,248,.04) 100%)" }}>
              <div className="absolute -top-28 -left-16 w-[320px] h-[320px] rounded-full bg-[rgba(0,255,163,.07)] blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-16 right-72 w-[200px] h-[200px] rounded-full bg-[rgba(56,189,248,.055)] blur-[80px] pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(0,255,163,.055)] border border-[rgba(0,255,163,.18)] rounded-full font-mono text-[10px] font-bold tracking-[.14em] uppercase text-[#00FFA3] mb-5">
                  <Sparkles size={10} /> Start for free
                </div>
                <h2 className="font-display font-extrabold text-white tracking-tight leading-[1.08]" style={{ fontSize: "clamp(26px,3.5vw,46px)" }}>
                  Ready to ship with<br />
                  <span className="gradient-accent">confidence?</span>
                </h2>
              </div>

              <MagneticBtn
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 px-12 py-5 bg-[#00FFA3] text-black font-display font-extrabold text-[16px] rounded-[16px] flex-shrink-0 transition-[box-shadow] hover:shadow-[0_0_44px_rgba(0,255,163,.35),0_8px_32px_rgba(0,255,163,.18)]"
              >
                Create Your Workspace <ArrowRight size={18} />
              </MagneticBtn>
            </section>
          </Reveal>
        </main>

        {/* ── FOOTER ── */}
        <footer className="max-w-[1280px] mx-auto px-12 py-6 border-t border-white/[0.055] flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00FFA3] rounded-[8px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Zap className="w-4 h-4 fill-black text-black relative z-10" />
            </div>
            <span className="font-mono text-[10px] text-[#52526a] tracking-[.14em] uppercase">© 2025 DEVFLOW LABORATORY</span>
          </div>
          <div className="flex gap-7">
            {["Privacy", "Terms", "Contact"].map(l => (
              <span key={l} className="font-mono text-[10px] text-[#52526a] hover:text-white tracking-[.1em] uppercase cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </footer>
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.8)", backdropFilter: "blur(22px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="relative w-full max-w-[440px] bg-[#0a0b11] border border-white/[0.115] rounded-[28px] p-11 overflow-hidden" style={{ boxShadow: "0 80px 160px rgba(0,0,0,.85)" }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(0,255,163,.5)] to-transparent" />
            <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-[#00FFA3] blur-[80px] opacity-[.045] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(0,255,163,.055)] border border-[rgba(0,255,163,.18)] rounded-full font-mono text-[10px] font-bold tracking-[.14em] uppercase text-[#00FFA3] mb-5">
              <Code2 size={10} /> New Workspace
            </div>

            {!user ? (
              /* ── Step 1: Login dulu ── */
              <>
                <h2 className="font-display text-[30px] font-extrabold tracking-[-0.03em] text-white mb-1.5">Sign In First</h2>
                <p className="text-[14px] text-[#52526a] mb-8">You need an account to create a workspace. It only takes a second.</p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-display font-extrabold text-[14px] rounded-[14px] transition-[box-shadow,opacity] hover:shadow-[0_0_44px_rgba(255,255,255,.15)] disabled:opacity-60"
                >
                  {isSigningIn ? (
                    "Signing in…"
                  ) : (
                    <>
                      {/* Google Icon */}
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
                <p className="text-center font-mono text-[10px] text-[#52526a] mt-5 tracking-wide">
                  Already have an account?{" "}
                  <span
                    onClick={() => { setIsModalOpen(false); router.push("/login"); }}
                    className="text-[#00FFA3] cursor-pointer hover:underline"
                  >
                    Sign in here
                  </span>
                </p>
              </>
            ) : (
              /* ── Step 2: Sudah login, isi form ── */
              <>
                <h2 className="font-display text-[30px] font-extrabold tracking-[-0.03em] text-white mb-1.5">Create Project</h2>
                <p className="text-[14px] text-[#52526a] mb-8">Define your new engineering workspace.</p>

                <form onSubmit={handleCreate} className="flex flex-col gap-5">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-[#52526a] tracking-[.14em] uppercase mb-2">Workspace Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      placeholder="e.g. Phoenix Engine"
                      className="w-full px-4 py-3.5 bg-black/45 border border-white/[0.055] rounded-xl text-white text-[14px] font-medium outline-none transition-[border-color] placeholder:text-white/10"
                      style={{ fontFamily: "'Onest',sans-serif" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(0,255,163,.32)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.055)")}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-[#52526a] tracking-[.14em] uppercase mb-2">
                      Description <span className="opacity-50">(optional)</span>
                    </label>
                    <textarea
                      value={projectDesc}
                      onChange={e => setProjectDesc(e.target.value)}
                      placeholder="Core backend architecture for our next-gen mobile app."
                      rows={3}
                      className="w-full px-4 py-3.5 bg-black/45 border border-white/[0.055] rounded-xl text-white text-[14px] font-medium outline-none resize-none transition-[border-color] placeholder:text-white/10"
                      style={{ fontFamily: "'Onest',sans-serif" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(0,255,163,.32)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.055)")}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#00FFA3] text-black font-display font-extrabold text-[14px] rounded-[14px] transition-[box-shadow,opacity] hover:shadow-[0_0_44px_rgba(0,255,163,.35)] disabled:opacity-50 mt-1"
                  >
                    {isCreating ? "Initializing…" : <><span>Create Workspace</span><ArrowUpRight size={16} /></>}
                  </button>
                </form>
              </>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 border border-white/[0.055] rounded-[8px] flex items-center justify-center text-[#52526a] hover:bg-white/[0.06] hover:border-white/20 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}