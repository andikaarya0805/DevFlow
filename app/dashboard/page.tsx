"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Layout
} from "lucide-react";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import { db, collection, onSnapshot, query, where, getDocs, doc, getDoc } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [projectData, setProjectData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [globalTasksCount, setGlobalTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Fetch Project Details
      if (projectId) {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProjectData(projectSnap.data());
        }
      }

      // 2. Real-time Global Tasks count
      const qTasks = collection(db, "global_tasks");
      const unsubTasks = onSnapshot(qTasks, (snapshot) => {
        setGlobalTasksCount(snapshot.size);
      });

      // 3. Real-time Team Progress (Filtered by projectId)
      if (!projectId) {
         setLoading(false);
         return;
      }
      
      const qProgress = query(collection(db, "user_project_progress"), where("projectId", "==", projectId));
      const unsubProgress = onSnapshot(qProgress, async (snapshot) => {
        const progressDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch User Details for these progress docs to get names/emails
        const expandedTeam = await Promise.all(progressDocs.map(async (p: any) => {
           const userSnap = await getDoc(doc(db, "users", p.userId));
           const userData = userSnap.data();
           return { ...p, ...userData, id: p.userId }; // Ensure ID is userId
        }));
        
        setTeamData(expandedTeam);
        setLoading(false);
      });

      return () => {
        unsubTasks();
        unsubProgress();
      };
    };

    fetchData();
  }, [projectId]);

  // Compute Real Metrics
  const activeDevs = teamData.length;
  const totalCompletedTasks = teamData.reduce((acc, user) => acc + (user.completedTasks?.length || 0), 0);
  const totalPossibleTasks = globalTasksCount * activeDevs;
  const pendingTasks = activeDevs > 0 ? totalPossibleTasks - totalCompletedTasks : 0;
  
  const averageProgress = activeDevs > 0 
    ? Math.round(teamData.reduce((acc, user) => acc + (user.progress || 0), 0) / activeDevs) 
    : 0;
    
  const alignmentRate = averageProgress;
  const driftRate = 100 - averageProgress;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {projectData?.name || "Global Workspace"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Project Overview</h1>
          <p className="text-zinc-400 font-medium max-w-md italic">Analyzing engineering health and team velocity in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-600/20 active:scale-95">
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pending Checklists" 
          value={pendingTasks} 
          icon={AlertTriangle} 
          description="Total uncompleted tasks across the team"
          variant={pendingTasks > 10 ? "error" : "success"}
          trend={{ value: pendingTasks, isUp: false }}
        />
        <StatCard 
          title="Active Developers" 
          value={activeDevs} 
          icon={Users} 
          description="Team members currently onboarding"
          trend={{ value: activeDevs, isUp: true }}
        />
        <StatCard 
          title="Team Alignment" 
          value={`${alignmentRate}%`} 
          icon={CheckCircle2} 
          description="Average onboarding progress rate"
          variant={alignmentRate >= 80 ? "success" : "warning"}
          trend={{ value: alignmentRate, isUp: true }}
        />
        <StatCard 
          title="Total Tasks Done" 
          value={totalCompletedTasks} 
          icon={TrendingUp} 
          description="Total checkpoints passed globally"
          trend={{ value: totalCompletedTasks, isUp: true }}
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Progress Section */}
        <section className="lg:col-span-2 glass p-8 rounded-[2.5rem] border-zinc-800/50 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white tracking-tight">Team Progress</h2>
            <button className="text-zinc-500 hover:text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors">
              View Detailed Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-8">
            {teamData.length > 0 ? (
              teamData.map((member: any) => (
                <div key={member.id} className="group glass-card p-6 rounded-3xl border-transparent hover:border-zinc-800/80 transition-all duration-500 bg-zinc-900/20">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {((member.name || member.email || "U").charAt(0)).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-lg font-bold text-white tracking-tight truncate w-full max-w-[200px]">{member.name || member.email}</h4>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{member.role}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      member.status === "Done" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
                      member.status === "Warning" ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                      member.status === "Behind" ? "border-red-500/20 text-red-500 bg-red-500/5" :
                      "border-indigo-500/20 text-indigo-500 bg-indigo-500/5"
                    )}>
                      {member.status || "Active"}
                    </span>
                  </div>
                  <ProgressBar label="Overall Health" value={member.progress || 0} showValue={true} size="md" />
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <Users className="w-12 h-12 text-zinc-800 mx-auto" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No developers joined yet.</p>
                <p className="text-zinc-600 text-sm max-w-xs mx-auto">Share your project link to start monitoring team progress.</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Mini Section */}
        <section className="space-y-8">
          <div className="glass p-8 rounded-[2rem] bg-indigo-900/5 border-indigo-500/10">
            <h3 className="text-lg font-bold text-white tracking-tight mb-4">Onboarding Pulse</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              You have {activeDevs} distinct developers working through their workflows. Environment setup compliance directly mirrors your updated standards constraints.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                Global Status: {alignmentRate >= 80 ? "Optimized" : "Needs Review"}
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Tasks Cleared: {totalCompletedTasks}
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-[2rem] border-zinc-800/50">
            <h3 className="text-lg font-bold text-white tracking-tight mb-4 text-center">Standards Drift</h3>
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-black text-white">{driftRate}%</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                  {driftRate > 20 ? "High Drift" : "Minimal Drift"}
                </span>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-900"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * (100 - driftRate)) / 100}
                  className={driftRate > 20 ? "text-amber-500" : "text-indigo-500"}
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
