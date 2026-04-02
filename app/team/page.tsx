"use client";

import React, { useState, useEffect } from "react";
import { JetBrains_Mono } from "next/font/google";
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { db, collection, query, where, onSnapshot, getDoc, doc } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { INITIAL_CHECKLIST } from "@/lib/constants";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function TeamProgress() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [teamData, setTeamData] = useState<any[]>([]);
  const [globalTasks, setGlobalTasks] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, "global_tasks"), (snapshot) => {
      setGlobalTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (!projectId) {
      setIsLoading(false);
      return;
    }

    // 1. Listen to Project Members first
    const projectRef = doc(db, "projects", projectId);
    const unsubProject = onSnapshot(projectRef, async (projectSnap) => {
      if (!projectSnap.exists()) {
        setIsLoading(false);
        return;
      }
      
      const memberIds = projectSnap.data().members || [];
      
      // 2. Fetch/Listen to all members' progress & details
      // We'll use a real-time listener for the user_project_progress collection
      // but filter it by the members we found.
      const q = query(collection(db, "user_project_progress"), where("projectId", "==", projectId));
      
      const unsubProgress = onSnapshot(q, async (snapshot) => {
        const progressMap = new Map();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          progressMap.set(data.userId, data);
        });

        const expandedTeam = await Promise.all(memberIds.map(async (userId: string) => {
           const userSnap = await getDoc(doc(db, "users", userId));
           const userData = userSnap.data() || {};
           const progressData = progressMap.get(userId) || {
              progress: 0,
              completedTasks: [],
              status: "Ready"
           };
           
           return { 
             ...userData, 
             ...progressData, 
             id: userId,
             role: userData.role || "developer" 
           };
        }));
        
        // Filter out the admin if needed, or show everyone.
        // Usually, admins might want to see themselves or not. 
        // Let's show everyone who has 'developer' role or is in the members list.
        setTeamData(expandedTeam.filter(m => m.id !== projectSnap.data().adminId));
        setIsLoading(false);
      });
      
      return () => unsubProgress();
    });

    return () => {
      unsubProject();
      unsubTasks();
    };
  }, [projectId]);

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return { bg: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Ready" };
    if (progress >= 50) return { bg: "bg-amber-500", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "In Progress" };
    return { bg: "bg-indigo-500", badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", label: "Just Started" };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-zinc-100">Team Onboarding Progress</h1>
        <p className="text-zinc-400 font-medium">Real-time overview of individual developer readiness. Expand to see exact task status.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamData.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
              No developers found yet. Share the app URL and let them sign in!
            </div>
          )}
          {teamData.map((dev) => {
            const colors = getStatusColor(dev.progress);
            const isExpanded = expandedId === dev.id;

            return (
              <div 
                key={dev.id} 
                className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] flex flex-col hover:border-zinc-700 transition-all duration-300 shadow-xl overflow-hidden glass"
              >
                <div className="p-8 space-y-6">
                  {/* Card Header: Avatar & Name & Badge */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-row items-center space-x-4">
                      {dev.photoURL ? (
                        <img src={dev.photoURL} alt={dev.name} className="h-12 w-12 rounded-2xl border border-zinc-700 object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl font-black text-indigo-400 border border-zinc-700">
                          {dev.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{dev.name}</h2>
                        <p className={`text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1`}>ID: {dev.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors.badge}`}>
                      {dev.status === "Done" ? "Ready" : "Active"}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-zinc-400">{colors.label}</span>
                      <span className={`text-3xl font-black tracking-tighter ${jetbrainsMono.className} text-white`}>
                        {dev.progress}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out shadow-lg ${colors.bg}`}
                        style={{ width: `${Math.max(dev.progress, 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="pt-4 border-t border-zinc-800/50 flex flex-col space-y-3">
                    <div className="flex items-center text-zinc-400 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-400" />
                      <span><b className="text-zinc-200">{dev.completedTasks.length}</b> of {globalTasks.length} Tasks Done</span>
                    </div>
                    <div className="flex items-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      <Clock className="w-4 h-4 mr-2 text-zinc-600" />
                      <span>{dev.lastActive?.toDate ? dev.lastActive.toDate().toLocaleString() : "Recently active"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Expand / Collapse Button */}
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : dev.id)}
                  className="w-full bg-zinc-950 border-t border-zinc-800/50 p-4 text-[11px] uppercase tracking-widest font-black text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isExpanded ? "Hide Details" : "View Detailed Progress"}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded Task List View */}
                {isExpanded && (
                  <div className="bg-zinc-950 p-6 border-t border-zinc-800/50 space-y-4">
                    <h4 className="text-xs uppercase font-black tracking-widest text-indigo-500 mb-4 px-2">Task Checklist</h4>
                    {globalTasks.map((task) => {
                      const isDone = dev.completedTasks.includes(task.id);
                      return (
                        <div key={task.id} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-zinc-900/50 transition-colors">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-700 shrink-0" />
                          )}
                          <div className="space-y-1">
                            <div className={`font-bold ${isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                              {task.title}
                            </div>
                            <div className="text-xs text-zinc-600 font-medium">
                              {task.category}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
