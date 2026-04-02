"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, doc, onSnapshot } from "@/lib/firebase";
import { 
  Terminal, 
  Trophy, 
  Target, 
  ArrowRight, 
  Code2, 
  Cpu, 
  Zap, 
  Rocket 
} from "lucide-react";
import Link from "next/link";

export default function UserPanel() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    
    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = userData.progress || 0;
  const isDone = progress === 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden glass p-10 rounded-[3rem] border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-8 z-10 bg-zinc-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-3xl border border-zinc-700 shadow-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-4xl font-black text-indigo-400">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute -bottom-3 -right-3 p-2 bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Developer Space
              </span>
              <span className="px-3 py-1 rounded-full border border-zinc-700/50 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {userData.status || "Active"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-2">
              Welcome back, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {user.displayName?.split(" ")[0]}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex w-full md:w-auto flex-col items-center md:items-end justify-center relative z-10 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 min-w-[240px]">
          <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Overall Progress</span>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-white tracking-tighter leading-none">{progress}</span>
            <span className="text-2xl font-bold text-zinc-500 pb-1">%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Next Action Card */}
        <section className="md:col-span-2 glass p-8 rounded-[2.5rem] border-zinc-800/50 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isDone ? "Ready for Production!" : "Continue Your Onboarding"}
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed max-w-lg">
              {isDone 
                ? "You have completed all your required onboarding tasks. You are now fully equipped to push code and collaborate with the team."
                : "Head over to your checklist to mark off your current environment setup and coding standards tasks. Your PM is monitoring your progress."}
            </p>
          </div>
          
          <div className="mt-8 relative z-10">
            <Link 
              href="/checklist" 
              className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white text-zinc-950 rounded-2xl font-bold hover:bg-zinc-100 transition-all duration-300 shadow-xl shadow-white/5 hover:shadow-white/10 active:scale-[0.98]"
            >
              {isDone ? "Review Checklist" : "Resume Checklist"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="space-y-6">
          <div className="glass p-6 rounded-3xl border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold tracking-tight">Tasks Done</h3>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-4xl font-black text-white">{userData.completedTasks?.length || 0}</span>
              <span className="text-zinc-500 font-medium pb-1">items</span>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-bold tracking-tight">Status</h3>
            </div>
            <div className="mt-4">
              <span className="text-lg font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 px-4 py-2 rounded-xl inline-block">
                {userData.status || "On Track"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Recommended Resources */}
      <section className="glass p-8 rounded-[2.5rem] border-zinc-800/50">
        <h3 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
          <Rocket className="w-6 h-6 text-indigo-400" />
          Developer Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Team Architecture", desc: "Read the system design docs.", icon: Cpu },
            { title: "Code Standards", desc: "View naming conventions & rules.", icon: Terminal, href: "/standards" },
            { title: "API Reference", desc: "Explore our internal endpoints.", icon: Code2 },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href || "#"} 
              className="p-5 rounded-2xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/30 hover:bg-zinc-900/80 transition-all duration-300 group"
            >
              <item.icon className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 mb-4 transition-colors" />
              <h4 className="text-white font-bold mb-1">{item.title}</h4>
              <p className="text-zinc-400 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
