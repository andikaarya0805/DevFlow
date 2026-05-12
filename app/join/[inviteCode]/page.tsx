"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { joinProjectByInviteCode } from "@/lib/project";
import { db, auth, collection, query, where, getDocs } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-hot-toast";
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  LogIn,
} from "lucide-react";
import Link from "next/link";

export default function JoinProjectPage() {
  const { inviteCode } = useParams() as { inviteCode: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch project info by invite code
  useEffect(() => {
    const fetchProject = async () => {
      if (!inviteCode) return;
      setIsFetching(true);
      try {
        const q = query(
          collection(db, "projects"),
          where("inviteCode", "==", inviteCode.toUpperCase())
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setFetchError("Invalid invite code. This project may not exist.");
        } else {
          const projectDoc = querySnapshot.docs[0];
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        }
      } catch (err) {
        setFetchError("Could not load project. Please check the link.");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProject();
  }, [inviteCode]);

  // After user logs in (via popup), auto-join if project is ready
  useEffect(() => {
    if (user && project && !isFetching && joinError?.includes("logged in")) {
      // User just signed in after a permission error — auto retry join
      handleJoin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will update `user` → auto-join handled in useEffect above
      toast.success("Signed in! Joining project...");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Sign in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleJoin = async () => {
    // Not logged in → trigger Google popup instead of redirecting
    if (!user) {
      await handleGoogleSignIn();
      return;
    }

    // Already a member → just redirect
    if (project?.members?.includes(user.uid)) {
      toast.success("You're already a member of this project!");
      router.push(`/dashboard?projectId=${project.id}`);
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const projectId = await joinProjectByInviteCode(inviteCode, user.uid);
      toast.success("Welcome to the team! 🎉");
      router.push(`/dashboard?projectId=${projectId}`);
    } catch (err: any) {
      const isPermission = err?.message?.toLowerCase().includes("permission") 
                        || err?.message?.toLowerCase().includes("missing");
      const msg = isPermission
        ? "Permission denied. Please make sure you're logged in and try again."
        : err?.message || "Failed to join project.";
      toast.error(msg);
      setJoinError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  const isLoading = isJoining || isSigningIn;
  const buttonLabel = isSigningIn
    ? "Signing in..."
    : isJoining
    ? "Joining Team..."
    : !user
    ? "Sign in & Accept Invitation"
    : "Accept Invitation";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background glow */}
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
              You&apos;ve been invited to join a workspace on{" "}
              <span className="text-indigo-400 font-black">DEVFLOW</span>.
            </p>
          </div>

          {/* Invite Code + Project Info */}
          <div className="w-full p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <span>Invite Code</span>
              <span className={`flex items-center gap-1 ${fetchError ? "text-red-500" : "text-emerald-500"}`}>
                {isFetching
                  ? "Checking..."
                  : fetchError
                  ? "Invalid"
                  : <><CheckCircle2 className="w-3 h-3" /> Validated</>
                }
              </span>
            </div>

            <div className="text-3xl font-black text-white tracking-widest bg-black/50 py-4 rounded-2xl border border-zinc-800/50">
              {inviteCode}
            </div>

            {/* Project details */}
            {project && (
              <div className="pt-4 border-t border-zinc-800/50 text-left space-y-1">
                <p className="text-white font-black text-lg">{project.name}</p>
                {project.description && (
                  <p className="text-zinc-500 text-sm">{project.description}</p>
                )}
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest pt-1">
                  {project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""} · Open workspace
                </p>
              </div>
            )}
          </div>

          {/* Not logged in notice */}
          {!authLoading && !user && !fetchError && (
            <div className="flex items-center gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-zinc-400 text-sm w-full">
              <LogIn className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>You&apos;ll be signed in with Google when you accept.</span>
            </div>
          )}

          {/* Error messages */}
          {fetchError ? (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold w-full">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {fetchError}
            </div>
          ) : joinError ? (
            <div className="flex flex-col gap-2 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl w-full">
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {joinError}
              </div>
              <p className="text-zinc-500 text-xs pl-6">
                Tap below to retry.
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm leading-relaxed px-4 italic">
              By joining, you will gain access to the project dashboard and checklist operations.
            </p>
          )}

          {/* Main CTA button */}
          <button
            onClick={handleJoin}
            disabled={isLoading || !!fetchError || isFetching}
            className="group w-full py-5 bg-white text-black font-black rounded-[2rem] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5"
          >
            {!user && !isLoading && (
              /* Google icon when not signed in */
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {buttonLabel}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-400 text-xs font-black uppercase tracking-widest transition-colors"
          >
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
