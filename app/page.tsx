"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  GitBranch,
  Activity,
  Code2,
  Lock,
} from "lucide-react";
import { animate as anime, random } from "animejs";
import { useAuth } from "@/context/AuthContext";
import { createProject } from "@/lib/project";
import { toast } from "react-hot-toast";

// ─── Reusable animated counter ────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      if (ref.current) ref.current.textContent = Math.floor(start) + suffix;
    }, 16);
    return () => clearInterval(timer);
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ── entrance animations ──────────────────────────────────────────────────
  useEffect(() => {
    anime(".reveal-up", {
      translateY: [40, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 1000,
      delay: (_: any, i: number) => 100 + i * 120,
    });
    anime(".reveal-scale", {
      scale: [0.85, 1],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 900,
      delay: (_: any, i: number) => 500 + i * 100,
    });
    // drifting glow orbs
    document.querySelectorAll(".glow-orb").forEach((el) => {
      anime(el, {
        translateX: () => random(-30, 30),
        translateY: () => random(-30, 30),
        duration: () => random(5000, 8000),
        easing: "easeInOutSine",
        direction: "alternate",
        loop: true,
      });
    });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); router.push("/login"); return; }
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

  // ── feature data ─────────────────────────────────────────────────────────
  const features = [
    {
      icon: Terminal,
      tag: "ONBOARDING",
      title: "Automated Checklists",
      desc: "Interactive onboarding workflows for zero-friction team scaling. Every new dev hits the ground running.",
      accent: "#00FFA3",
    },
    {
      icon: ShieldCheck,
      tag: "COMPLIANCE",
      title: "Standards Enforcer",
      desc: "Enforce architectural guardrails, track technical-debt drift, and gate deploys on quality thresholds.",
      accent: "#38BDF8",
    },
    {
      icon: Activity,
      tag: "OBSERVABILITY",
      title: "Live Project Health",
      desc: "Real-time metrics on team velocity, issue backlog, and codebase decay — all in one unified view.",
      accent: "#F472B6",
    },
  ];

  const stats = [
    { value: 3200, suffix: "+", label: "Projects Monitored" },
    { value: 98, suffix: "%", label: "Compliance Rate" },
    { value: 40, suffix: "%", label: "Faster Onboarding" },
    { value: 500, suffix: "+", label: "Engineering Teams" },
  ];

  return (
    <>
      {/* ── Google Fonts ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Onest:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #050608;
          --surface: #0d0e12;
          --border: rgba(255,255,255,0.07);
          --border-bright: rgba(255,255,255,0.15);
          --text: #f0f0f5;
          --muted: #6b6b7e;
          --accent: #00FFA3;
          --accent2: #38BDF8;
          --accent3: #F472B6;
          --indigo: #6366f1;
        }

        body { background: var(--bg); color: var(--text); }

        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'Onest', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        /* ── Grid overlay ── */
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Noise texture ── */
        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 128px;
          opacity: 0.4;
          z-index: 0;
        }

        /* ── Glow orbs ── */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.35;
        }

        /* ── Gradient text ── */
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #a0a0b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-accent {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Pill badge ── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0,255,163,0.25);
          background: rgba(0,255,163,0.05);
          color: var(--accent);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          backdrop-filter: blur(12px);
        }

        /* ── Primary button ── */
        .btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.03em;
          color: #000;
          background: var(--accent);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fff2 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,255,163,0.3); }
        .btn-primary:active { transform: translateY(0); }

        /* ── Ghost button ── */
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--text);
          background: transparent;
          border: 1px solid var(--border-bright);
          border-radius: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.05);
          transform: translateY(-1px);
        }

        /* ── Feature card ── */
        .feat-card {
          position: relative;
          padding: 32px;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: all 0.4s ease;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.06));
          pointer-events: none;
        }
        .feat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }

        /* ── Stat card ── */
        .stat-card {
          padding: 28px 32px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          text-align: center;
          flex: 1;
          min-width: 140px;
        }

        /* ── Terminal decoration ── */
        .terminal-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        /* ── Input ── */
        .modal-input {
          width: 100%;
          padding: 14px 18px;
          background: #09090e;
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-family: 'Onest', sans-serif;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s;
        }
        .modal-input::placeholder { color: #3a3a4e; }
        .modal-input:focus { border-color: rgba(0,255,163,0.4); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }

        /* ── Keyframes ── */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }

        .reveal-up { opacity: 0; }
        .reveal-scale { opacity: 0; }
      `}</style>

      <div className="noise font-body" style={{ position: "relative", minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflow: "hidden" }}>

        {/* ── Background layer ──────────────────────────────────────────── */}
        <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0 }} />
        <div className="glow-orb" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(0,255,163,0.12) 0%, transparent 70%)", top: "-10%", left: "-5%" }} />
        <div className="glow-orb" style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)", bottom: "-15%", right: "-10%" }} />
        <div className="glow-orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)", top: "50%", left: "50%" }} />

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto border-b border-[var(--border)] backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tighter text-white">
              DEVFLOW
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/dashboard" className="hidden sm:block px-4 py-2 text-[var(--muted)] hover:text-white font-medium text-sm transition-colors rounded-lg">
              Dashboard
            </Link>

            {user ? (
              <button className="btn-primary !py-2 !px-4 md:!px-6 !text-xs md:!text-sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 md:mr-1" /> <span className="hidden md:inline">New Project</span>
              </button>
            ) : (
              <Link href="/login" className="btn-primary !py-2 !px-4 md:!px-6 !text-xs md:!text-sm no-underline">
                Sign In <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-24 text-center">

          {/* Badge */}
          <div className="reveal-up mb-8 flex justify-center">
            <span className="badge">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Engineering Excellence Redefined
            </span>
          </div>

          {/* Headline */}
          <div className="reveal-up mb-8">
            <h1 className="font-display gradient-text text-[38px] sm:text-6xl md:text-8xl lg:text-[110px] font-extrabold leading-[0.9] tracking-tight md:tracking-tighter">
              Engineering
              <br />
              <span className="gradient-text-accent">Health</span> Control
            </h1>
          </div>

          {/* Subheadline */}
          <div className="reveal-up mb-12 max-w-2xl mx-auto">
            <p className="text-[17px] md:text-lg text-[var(--muted)] leading-relaxed font-body">
              The unified control center for technical debt, developer onboarding,
              and architectural standards — built for teams that ship without compromise.
            </p>
          </div>

          {/* CTAs */}
          <div className="reveal-up flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
            <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
              Launch New Project <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/dashboard" className="btn-ghost w-full sm:w-auto no-underline">
              Enter Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── Terminal Mockup ── */}
          <div className="reveal-scale max-w-2xl mx-auto mb-20 md:mb-32 rounded-2xl border border-[var(--border-bright)] bg-[var(--surface)]/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Title bar */}
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
              <span className="terminal-dot bg-[#FF5F57]" />
              <span className="terminal-dot bg-[#FEBC2E]" />
              <span className="terminal-dot bg-[#28C840]" />
              <span className="font-mono text-[var(--muted)] text-xs ml-3 hidden sm:inline">devflow — health check</span>
              <span className="font-mono text-[var(--muted)] text-[10px] ml-3 sm:hidden">devflow --health</span>
            </div>
            {/* Content */}
            <div className="font-mono p-6 md:p-8 text-xs md:text-sm leading-relaxed text-[#7a7a90] text-left">
              <div><span className="text-[var(--accent)]">✔</span> Scanning <span className="text-white">phoenix-engine</span> repo…</div>
              <div><span className="text-[var(--accent)]">✔</span> Architecture compliance: <span className="text-[var(--accent)]">98.2%</span></div>
              <div className="truncate"><span className="text-[var(--accent2)]">◈</span> Technical debt: <span className="text-[var(--accent3)]">12 med</span>, <span className="text-[var(--accent)]">2 low</span></div>
              <div><span className="text-[var(--accent)]">✔</span> Onboarding: <span className="text-[var(--accent)]">14 / 14</span> completed</div>
              <div className="mt-2 text-[var(--muted)]">$ <span className="text-white animate-pulse">_</span></div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="reveal-scale grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-24 md:mb-32">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="font-display text-3xl md:text-5xl font-extrabold text-white leading-none">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[10px] md:text-xs text-[var(--muted)] mt-3 font-semibold uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Feature Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="feat-card reveal-scale group relative overflow-hidden">
                {/* Glow accent top-right */}
                <div 
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
                  style={{ background: f.accent }}
                />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl border border-[var(--border-bright)] bg-white/5 flex items-center justify-center text-[var(--accent)]" style={{ color: f.accent }}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase border border-white/10 rounded-md px-2 py-1 opacity-70" style={{ color: f.accent, borderColor: f.accent + '33' }}>
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display text-xl md:text-2xl font-bold mb-3 tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed font-body">
                  {f.desc}
                </p>

                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer" style={{ color: f.accent }}>
                  Learn more <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom CTA Banner ── */}
          <div className="reveal-scale mt-24 md:mt-40 p-8 md:p-16 rounded-[32px] border border-[var(--border-bright)] bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent2)]/5 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between text-left gap-10 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[60px]" />
            <div className="relative">
              <div className="badge mb-6">
                <Sparkles className="w-3 h-3" /> Start for free
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Ready to ship with<br />
                <span className="gradient-text-accent">confidence?</span>
              </h2>
            </div>
            <button className="btn-primary w-full md:w-auto text-base py-4 px-8 shrink-0 relative" onClick={() => setIsModalOpen(true)}>
              Create Your Workspace <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="font-mono text-[10px] text-[var(--muted)] tracking-[0.2em] uppercase">
              © 2024 DEVFLOW LABORATORY
            </span>
          </div>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Contact"].map((t) => (
              <span key={t} className="font-mono text-[10px] text-[var(--muted)] hover:text-white cursor-pointer tracking-wider transition-colors uppercase">
                {t}
              </span>
            ))}
          </div>
        </footer>

        {/* ── Create Project Modal ──────────────────────────────────────── */}
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            {/* Backdrop */}
            <div
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
            />
            {/* Panel */}
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: 440,
              background: "var(--surface)",
              border: "1px solid var(--border-bright)",
              borderRadius: 28,
              padding: "40px 40px 36px",
              boxShadow: "0 80px 160px rgba(0,0,0,0.8), 0 0 80px rgba(0,255,163,0.05)",
              overflow: "hidden",
            }}>
              {/* glow accent */}
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "var(--accent)", opacity: 0.06, filter: "blur(60px)", pointerEvents: "none" }} />

              {/* Header */}
              <div className="badge" style={{ marginBottom: 20 }}>
                <Code2 style={{ width: 11, height: 11 }} /> New Workspace
              </div>
              <h2 className="font-display" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>
                Create Project
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32, fontWeight: 400 }}>
                Define your new engineering workspace.
              </p>

              <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    Workspace Name
                  </label>
                  <input
                    className="modal-input"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Phoenix Engine"
                  />
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    Description <span style={{ opacity: 0.5 }}>(optional)</span>
                  </label>
                  <textarea
                    className="modal-input"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Core backend architecture for our next-gen mobile app."
                    rows={3}
                    style={{ resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating}
                  style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: isCreating ? 0.6 : 1 }}
                >
                  {isCreating ? "Initializing…" : <>Create Workspace <ArrowUpRight style={{ width: 16, height: 16 }} /></>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}