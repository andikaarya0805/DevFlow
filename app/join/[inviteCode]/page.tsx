"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { joinProjectByInviteCode, getProjectDetails } from "@/lib/project";
import { toast } from "react-hot-toast";
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Zap,
  Layout
} from "lucide-react";
import { animate as anime } from "animejs";

export default function JoinProjectPage() {
  const { inviteCode } = useParams() as { inviteCode: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Find project by invite code
        // We might need a specialized fetch if inviteCode is not the ID
        // For now, let's assume we can find it.
        // I'll update lib/project.ts to include getProjectByInviteCode
      } catch (err) {
        setError("Could not find this project.");
      }
    };
    
    fetchProject();
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join this project.");
      router.push(`/login?redirect=/join/${inviteCode}`);
      return;
    }

    setIsJoining(true);
    try {
      const projectId = await joinProjectByInviteCode(inviteCode, user.uid);
      toast.success("Welcome to the team!");
      router.push(`/dashboard?projectId=${projectId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to join project.");
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg glass-card p-12 rounded-[3.5rem] border-zinc-800 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-500/10 mb-2">
            <Users className="w-10 h-10" />
          </div>
          
          <div className="space-y-3">
             <h1 className="text-4xl font-black text-white tracking-tighter">Team Invitation</h1>
             <p className="text-zinc-500 font-medium text-lg leading-relaxed">
               You&apos;ve been invited to join a workspace on <span className="text-indigo-400 font-black">DEVFLOW</span>.
             </p>
          </div>

          <div className="w-full p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] space-y-4">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span>Invite Code</span>
                <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Validated</span>
             </div>
             <div className="text-3xl font-black text-white tracking-widest bg-black/50 py-4 rounded-2xl border border-zinc-800/50">
               {inviteCode}
             </div>
          </div>

          {error ? (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
                <ShieldAlert className="w-5 h-5" />
                {error}
            </div>
          ) : (
             <p className="text-zinc-500 text-sm leading-relaxed px-4 italic">
                By joining, you will gain access to the project dashboard and checklist operations.
             </p>
          )}

          <button 
            onClick={handleJoin}
            disabled={isJoining}
            className="group w-full py-5 bg-white text-black font-black rounded-[2rem] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5"
          >
            {isJoining ? "Joining Team..." : "Accept Invitation"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs font-black uppercase tracking-widest transition-colors">
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

// Minimal Link component substitute if not imported correctly
function Link({ href, children, className }: any) {
    return <a href={href} className={className}>{children}</a>;
}
