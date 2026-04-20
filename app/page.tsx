"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Terminal,
  ShieldCheck,
  Activity,
  Code2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createProject } from "@/lib/project";
import { toast } from "react-hot-toast";

// Helper Components
import { CustomCursor, Magnetic, ParticleBackground } from "@/components/VisualEffects";
import { TiltCard, TypewriterTerminal } from "@/components/TiltEffects";

// ─── Reusable animated counter ────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const end = target;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}{suffix}</span>;
}

// ─── Animated Line Component ────────────────────────────────────────────────
const AnimatedLine = () => (
  <motion.div 
    initial={{ width: 0, opacity: 0 }}
    whileInView={{ width: "100%", opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, ease: "circOut" }}
    className="h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-20"
  />
);

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Onest:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --bg: #050608;
          --surface: #0d0e12;
          --accent: #00FFA3;
          --accent2: #38BDF8;
          --accent3: #F472B6;
        }

        body { background: var(--bg); cursor: none; }
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body { font-family: 'Onest', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .glass {
          background: rgba(13, 14, 18, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .gradient-border-box {
          position: relative;
          border-radius: 2rem;
          background: var(--surface);
          z-index: 1;
        }

        .gradient-border-box::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 2.1rem;
          padding: 2px;
          background: linear-gradient(45deg, var(--accent), var(--accent2), var(--accent3), var(--accent));
          background-size: 400% 400%;
          animation: gradient-move 8s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: -1;
        }

        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .marquee-content {
          display: flex;
          gap: 4rem;
          animation: marquee 30s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="font-body text-zinc-100 min-h-screen selection:bg-emerald-500/30">
        <CustomCursor />
        <ParticleBackground />

        {/* ── Navigation ── */}
        <nav className="fixed top-0 inset-x-0 z-50 px-6 py-6 transition-all border-b border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Zap className="w-5 h-5 text-black fill-black" />
              </div>
              <span className="font-display text-xl font-black tracking-tighter">DEVFLOW</span>
            </motion.div>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex gap-6">
                {["Product", "Framework", "Enterprise", "Pricing"].map((item) => (
                  <Link key={item} href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-all relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all group-hover:w-full" />
                  </Link>
                ))}
              </div>
              <Magnetic>
                <Link href="/login" className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors">
                  Get Started
                </Link>
              </Magnetic>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative pt-44 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-black tracking-widest uppercase mb-12 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <Sparkles className="w-3 h-3" />
              Engineering Excellence Redefined
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl lg:text-[120px] font-black leading-[0.85] tracking-tighter mb-10"
            >
              Engineering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] animate-gradient-move">Quality</span> Control
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
            >
              The unified control center for technical debt, automated onboarding, and architectural standards. built for teams that ship without compromise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
            >
              <Magnetic>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
                >
                  Launch Project <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Magnetic>
              <Magnetic>
                <Link href="/dashboard" className="glass px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-white/5 transition-all">
                  Dashboard <ChevronRight className="w-5 h-5" />
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </section>

        {/* ── Marquee Ticker ── */}
        <div className="relative py-12 border-y border-white/5 overflow-hidden">
          <div className="marquee-content whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="inline-flex items-center gap-4 text-zinc-500 font-display font-black text-2xl tracking-tighter opacity-40 uppercase">
                <Zap className="w-6 h-6 fill-zinc-500" />
                Trusted by 500+ Engineering Teams
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />
        </div>

        {/* ── Terminal Section ── */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <TiltCard className="relative glass rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <span className="font-mono text-[10px] text-zinc-500 ml-4 font-bold uppercase tracking-widest">devflow health check</span>
              </div>
              <div className="p-10 min-h-[250px]">
                <TypewriterTerminal lines={[
                  "scanning phoenix-engine repository...",
                  "analyzing structural dependencies...",
                  "98.2% architecture compliance detected.",
                  "checking onboarding status...",
                  "system status: optimal. ready to deploy."
                ]} />
              </div>
            </TiltCard>
          </div>
        </section>

        <AnimatedLine />

        {/* ── Features ── */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity:0, y:20 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-6"
            >
              Ship Fast, <br /> Don't Break Things.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard className="group h-full p-10 glass rounded-[2.5rem] relative overflow-hidden flex flex-col">
                  {/* Accent orbs */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: f.accent }} />
                  
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <f.icon className="w-7 h-7" style={{ color: f.accent }} />
                  </div>

                  <span className="font-mono text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: f.accent }}>{f.tag}</span>
                  <h3 className="font-display text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed mb-auto">{f.desc}</p>
                  
                  <div className="mt-10 flex items-center gap-2 text-sm font-black transition-all group-hover:gap-4" style={{ color: f.accent }}>
                    Documentation <ArrowUpRight className="w-4 h-4" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        <AnimatedLine />

        {/* ── Stats ── */}
        <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-4 text-emerald-400">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <p className="font-mono text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-44 px-6 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-border-box p-16 md:p-24 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-zinc-950/40 backdrop-blur-3xl -z-10" />
            <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-10 animate-pulse" />
            <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                Ready to ship with<br />
                <span className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-[12px]">confidence?</span>
            </h2>
            <p className="text-zinc-500 text-lg mb-12 max-w-xl mx-auto font-medium">Join 500+ engineering teams that prioritize developer experience and code health.</p>
            
            <Magnetic>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-100 text-black px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all active:scale-95"
              >
                Create Workspace
              </button>
            </Magnetic>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-20 px-6 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="font-mono text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">© 2024 DEVFLOW LABS</span>
          </div>
          <div className="flex gap-12 font-mono text-[10px] font-black text-zinc-600 tracking-widest uppercase">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Twitter</span>
          </div>
        </footer>

        {/* ── Modal (kept mostly same but with visual polish) ── */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md glass p-12 rounded-[3rem] shadow-2xl border border-white/5"
              >
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setIsModalOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <div className="badge mb-6">New Workspace</div>
                <h2 className="font-display text-4xl font-black mb-2 tracking-tighter">Create Project</h2>
                <p className="text-zinc-500 text-sm mb-10 font-medium tracking-tight">Define your engineering playground.</p>

                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div>
                    <label className="font-mono text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Project Name</label>
                    <input
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Phoenix Engine"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Description</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="Core backend architecture..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)]"
                  >
                    {isCreating ? "Initializing..." : "Create Workspace"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}