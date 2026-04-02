"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, db, getDoc, doc, setDoc, updateDoc, serverTimestamp } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Infinity } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, role, loading: authLoading } = useAuth();

  // 1. Handle Redirect Result on Mount (Essential for Mobile)
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoggingIn(true);
          await syncUserProfile(result.user);
        }
      } catch (error: any) {
        console.error("Redirect login error:", error);
        if (error.code !== "auth/popup-closed-by-user") {
          toast.error(error.message || "Failed to sign in with Google redirect");
        }
      } finally {
        setIsLoggingIn(false);
      }
    };
    handleRedirect();
  }, []);

  // 2. Navigation if already logged in
  useEffect(() => {
    if (user && !authLoading && role) {
      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/checklist");
      }
    }
  }, [user, role, authLoading, router]);

  // Unified User Sync Logic
  const syncUserProfile = async (currentUser: any) => {
    const ADMIN_EMAIL = "andikaaryapratama0805@gmail.com"; 
    const isAdmin = currentUser.email === ADMIN_EMAIL;
    const assignedRole = isAdmin ? "admin" : "developer";

    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        progress: 0,
        status: "Active",
        role: assignedRole,
        completedTasks: [],
        joinedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      toast.success("Welcome to DevFlow! Account created.");
    } else {
      const existingData = userSnap.data();
      if (isAdmin && existingData.role !== "admin") {
        await updateDoc(userRef, { role: "admin" });
      }
      toast.success(`Welcome back, ${currentUser.displayName?.split(" ")[0]}!`);
    }
    
    // AuthContext will handle state, but we can nudge router
    // Navigation is handled by the other useEffect
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    // 🧩 STRATEGY: Call popup immediately to preserve "User Gesture" context
    // Some mobile browsers block popups if any async work (like state updates) happens first.
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setIsLoggingIn(true);
      await syncUserProfile(result.user);
    } catch (error: any) {
      console.warn("Popup blocked or failed, falling back to redirect:", error.code);
      if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
        setIsLoggingIn(true);
        // Fallback for Mobile: Redirect
        await signInWithRedirect(auth, googleProvider);
      } else if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 z-50">
      <div className="w-full max-w-md space-y-8 glass p-10 rounded-3xl border border-zinc-800/50 shadow-2xl relative overflow-hidden bg-zinc-900/50">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-400/20 ring-1 ring-white/10">
            <Infinity className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white m-0">DevFlow</h1>
            <p className="text-sm text-zinc-400 font-medium">Standardize your workflow from day one.</p>
          </div>
        </div>

        <div className="pt-4 relative z-10 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 active:scale-[0.98]"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isLoggingIn ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-[10px] text-zinc-500 text-center px-4 leading-relaxed italic">
            Trouble logging in? Ensure <code className="text-zinc-400">localhost:3000</code> is authorized in your Google Console.
          </p>
        </div>

      </div>
    </div>
  );
}
