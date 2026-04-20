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
  Layout,
  Settings,
  Globe,
  Github,
  Bell,
  Clock as ClockIcon,
  Zap,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useConfirm } from "@/context/ConfirmContext";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import AIInsights from "@/components/AIInsights";
import { db, collection, onSnapshot, query, where, getDocs, doc, getDoc, updateDoc, checkTeamStagnation, removeUserFromProject } from "@/lib/firebase";
import { sendWebhookNotification } from "@/lib/notifications";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const confirm = useConfirm();
  
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [projectData, setProjectData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [globalTasksCount, setGlobalTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [technicalDebts, setTechnicalDebts] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    repoUrl: "",
    repoType: "github",
    repoToken: "",
    webhookUrl: "",
    stagnancyLimitHours: 24
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Fetch Project Details
      if (projectId) {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setProjectData(data);
          setSettingsForm({
            repoUrl: data.repoUrl || "",
            repoType: data.repoType || "github",
            repoToken: data.repoToken || "",
            webhookUrl: data.webhookUrl || "",
            stagnancyLimitHours: data.stagnancyLimitHours || 24
          });
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
           const userData = userSnap.data() || {};
           return { ...userData, ...p, id: p.userId }; // Progress Data (p) must spread last to win
        }));
        
        setTeamData(expandedTeam);
        setLoading(false);
      });

      // 4. Real-time Technical Debts
      const unsubDebts = onSnapshot(collection(db, "technical_debts"), (snapshot) => {
        setTechnicalDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubTasks();
        unsubProgress();
        unsubDebts();
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

  const handleSaveSettings = async () => {
    if (!projectId) return;
    try {
        await updateDoc(doc(db, "projects", projectId), settingsForm);
        toast.success("Project automation settings updated");
        setShowSettings(false);
    } catch (err) {
        toast.error("Failed to update settings");
    }
  };

  const handleRunHealthCheck = async () => {
    if (!projectId || !projectData) return;
    const loadingToast = toast.loading("Checking team pulse...");
    try {
      const stagnancyLimit = projectData.stagnancyLimitHours || 24;
      const blockedCount = await checkTeamStagnation(projectId, stagnancyLimit);
      
      if (blockedCount && blockedCount > 0 && projectData.webhookUrl) {
          await sendWebhookNotification(
              projectData.webhookUrl,
              { 
                projectId: projectId,
                projectName: projectData?.name || "Unknown Project",
                userId: "SYSTEM_BOT",
                userName: "DevFlow Automation",
                status: "Alert",
                message: `⚠️ ${blockedCount} developers marked as BLOCKED due to inactivity (> ${stagnancyLimit}h).`
              }
          );
          toast.success(`${blockedCount} developers marked as blocked & notified via Webhook`, { id: loadingToast });
      } else {
          toast.success("Team health check complete. All pulse signals normal.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Health check failed", { id: loadingToast });
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!projectId || !isAdmin) return;
    
    const isConfirmed = await confirm({
      title: "Remove Team Member?",
      message: `Are you sure you want to remove ${memberName} from this project? This will delete all their progress checkpoints.`,
      type: "danger"
    });

    if (!isConfirmed) return;

    const loadToast = toast.loading(`Removing ${memberName}...`);
    try {
      await removeUserFromProject(userId, projectId);
      toast.success(`${memberName} has been removed from the project.`, { id: loadToast });
    } catch (err) {
      toast.error("Failed to remove member", { id: loadToast });
    }
  };

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
          
          <button 
            onClick={handleRunHealthCheck}
            className="p-3 bg-zinc-900 border border-zinc-800 text-emerald-400 rounded-2xl hover:text-emerald-300 hover:border-emerald-500/50 transition-all active:scale-95 shadow-xl group/check"
            title="Run Health Check"
          >
            <Zap className="w-5 h-5 group-hover/check:animate-pulse" />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl hover:text-white hover:border-zinc-700 transition-all active:scale-95 shadow-xl"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12 space-y-8 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tight">Automation Settings</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Git hooks, Webhooks & Stagnancy</p>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Github className="w-3.5 h-3.5" /> Repository Sync
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Repo URL</label>
                                <input 
                                    value={settingsForm.repoUrl} onChange={(e) => setSettingsForm({...settingsForm, repoUrl: e.target.value})}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all" 
                                    placeholder="https://github.com/org/repo"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Personal Access Token</label>
                                <input 
                                    type="password"
                                    value={settingsForm.repoToken} onChange={(e) => setSettingsForm({...settingsForm, repoToken: e.target.value})}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all" 
                                    placeholder="ghp_xxxxxxxxxxxx"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <Bell className="w-3.5 h-3.5" /> Push Notifications
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Webhook URL (Slack/Discord)</label>
                                <input 
                                    value={settingsForm.webhookUrl} onChange={(e) => setSettingsForm({...settingsForm, webhookUrl: e.target.value})}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all" 
                                    placeholder="https://hooks.slack.com/..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Stagnancy Alert (Hours)</label>
                                <div className="flex items-center gap-3">
                                    <ClockIcon className="w-4 h-4 text-zinc-600" />
                                    <input 
                                        type="number"
                                        value={settingsForm.stagnancyLimitHours} onChange={(e) => setSettingsForm({...settingsForm, stagnancyLimitHours: parseInt(e.target.value)})}
                                        className="w-20 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all" 
                                    />
                                    <span className="text-xs text-zinc-500 font-bold">hours of inactivity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-900 flex justify-end gap-3">
                      <button onClick={() => setShowSettings(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleSaveSettings} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                        Save Automation Settings
                      </button>
                  </div>
              </div>
          </div>
      )}

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
                    <div className="flex items-center gap-2">
                        <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        member.status === "Done" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
                        member.status === "Warning" ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                        member.status === "Behind" ? "border-red-500/20 text-red-500 bg-red-500/5" :
                        "border-indigo-500/20 text-indigo-500 bg-indigo-500/5"
                        )}>
                        {member.status || "Active"}
                        </span>
                        
                        {isAdmin && (
                            <button 
                                onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Remove Member"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
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
          
          <AIInsights teamProgress={teamData} technicalDebts={technicalDebts} />

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
