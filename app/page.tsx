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
        <nav style={{
          position: "relative",
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 48px",
          maxWidth: 1280,
          margin: "0 auto",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: "var(--accent)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap style={{ width: 18, height: 18, color: "#000", fill: "#000" }} />
            </div>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
              DEVFLOW
            </span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/dashboard" style={{
              padding: "8px 18px",
              color: "var(--muted)",
              fontFamily: "'Onest', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 10,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
            >
              Dashboard
            </Link>

            {user ? (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: "10px 22px", fontSize: 13 }}>
                <Plus style={{ width: 14, height: 14 }} /> New Project
              </button>
            ) : (
              <Link href="/login" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13, textDecoration: "none" }}>
                Sign In <ArrowUpRight style={{ width: 14, height: 14 }} />
              </Link>
            )}
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <main style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "90px 48px 120px" }}>

          {/* Badge */}
          <div className="reveal-up" style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Engineering Excellence Redefined
            </span>
          </div>

          {/* Headline */}
          <div className="reveal-up" style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 className="font-display gradient-text" style={{
              fontSize: "clamp(52px, 8vw, 96px)",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}>
              Engineering
              <br />
              <span className="gradient-text-accent">Health</span>{" "}Control
            </h1>
          </div>

          {/* Subheadline */}
          <div className="reveal-up" style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{
              maxWidth: 560,
              margin: "0 auto",
              color: "var(--muted)",
              fontSize: 17,
              lineHeight: 1.75,
              fontWeight: 400,
            }}>
              The unified control center for technical debt, developer onboarding,
              and architectural standards — built for teams that ship without compromise.
            </p>
          </div>

          {/* CTAs */}
          <div className="reveal-up" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 80 }}>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              Launch New Project <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <Link href="/dashboard" className="btn-ghost">
              Enter Dashboard <ChevronRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>

          {/* ── Terminal Mockup ── */}
          <div className="reveal-scale" style={{
            maxWidth: 700,
            margin: "0 auto 100px",
            borderRadius: 20,
            border: "1px solid var(--border-bright)",
            background: "rgba(13,14,18,0.8)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            {/* Title bar */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="terminal-dot" style={{ background: "#FF5F57" }} />
              <span className="terminal-dot" style={{ background: "#FEBC2E" }} />
              <span className="terminal-dot" style={{ background: "#28C840" }} />
              <span className="font-mono" style={{ color: "var(--muted)", fontSize: 12, marginLeft: 12 }}>devflow — health check</span>
            </div>
            {/* Content */}
            <div className="font-mono" style={{ padding: "24px 28px", fontSize: 13, lineHeight: 1.8, color: "#7a7a90" }}>
              <div><span style={{ color: "#00FFA3" }}>✔</span> Scanning <span style={{ color: "#fff" }}>phoenix-engine</span> repo…</div>
              <div><span style={{ color: "#00FFA3" }}>✔</span> Architecture compliance: <span style={{ color: "#00FFA3" }}>98.2%</span></div>
              <div><span style={{ color: "#38BDF8" }}>◈</span> Technical debt items: <span style={{ color: "#F472B6" }}>12 medium</span>, <span style={{ color: "#00FFA3" }}>2 low</span></div>
              <div><span style={{ color: "#00FFA3" }}>✔</span> Onboarding checklist: <span style={{ color: "#00FFA3" }}>14 / 14</span> completed</div>
              <div style={{ marginTop: 8 }}><span style={{ color: "#6b6b7e" }}>$</span> <span style={{ color: "#fff" }}>_</span><span style={{ animation: "pulse 1s infinite" }}>|</span></div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="reveal-scale" style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 100,
          }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Feature Cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card reveal-scale">
                {/* Glow accent top-right */}
                <div style={{
                  position: "absolute",
                  top: -30, right: -30,
                  width: 120, height: 120,
                  borderRadius: "50%",
                  background: f.accent,
                  filter: "blur(60px)",
                  opacity: 0.12,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 14,
                    border: "1px solid var(--border-bright)",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.accent,
                  }}>
                    <f.icon style={{ width: 22, height: 22 }} />
                  </div>
                  <span className="font-mono" style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                    color: f.accent, opacity: 0.7,
                    border: `1px solid ${f.accent}33`,
                    borderRadius: 6, padding: "3px 8px",
                  }}>
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {f.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.75, fontWeight: 400 }}>
                  {f.desc}
                </p>

                <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, color: f.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Learn more <ArrowUpRight style={{ width: 14, height: 14 }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom CTA Banner ── */}
          <div className="reveal-scale" style={{
            marginTop: 100,
            padding: "56px 64px",
            borderRadius: 28,
            border: "1px solid var(--border-bright)",
            background: "linear-gradient(135deg, rgba(0,255,163,0.05) 0%, rgba(56,189,248,0.04) 100%)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 32,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -80, top: -80, width: 300, height: 300, borderRadius: "50%", background: "var(--accent)", opacity: 0.04, filter: "blur(60px)" }} />
            <div>
              <div className="badge" style={{ marginBottom: 16 }}>
                <Sparkles style={{ width: 11, height: 11 }} /> Start for free
              </div>
              <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Ready to ship with<br />
                <span className="gradient-text-accent">confidence?</span>
              </h2>
            </div>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: 15, padding: "18px 36px", flexShrink: 0 }}>
              Create Your Workspace <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 48px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 14, height: 14, color: "#000", fill: "#000" }} />
            </div>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em" }}>
              © 2024 DEVFLOW LABORATORY
            </span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map((t) => (
              <span key={t} className="font-mono" style={{ fontSize: 11, color: "var(--muted)", cursor: "pointer", letterSpacing: "0.08em", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
              >
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