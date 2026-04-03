"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckSquare, Terminal, Cpu, GitBranch, Layers,
  Sparkles, Search, Settings2, Plus, X, Save, Trash2, Edit2
} from "lucide-react";
import ChecklistItem from "@/components/ChecklistItem";
import { db, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, serverTimestamp, updateUserProgress } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { INITIAL_CHECKLIST } from "@/lib/constants";
import toast from "react-hot-toast";

export default function ChecklistPage() {
  const { user, role, userData } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || userData?.currentProjectId;
  const isAdmin = role === "admin";

  const [globalTasks, setGlobalTasks] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Admin Mode States
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [projectRepo, setProjectRepo] = useState<any>(null);
  const [stagnancyLimit, setStagnancyLimit] = useState(24);

  // 1. Fetch Global Tasks (with auto-seed if empty)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "global_tasks"), async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed from INITIAL_CHECKLIST
        for (const task of INITIAL_CHECKLIST) {
          const { completed, ...dbTask } = task; // Exclude user-specific 'completed' state
          await setDoc(doc(db, "global_tasks", dbTask.id), dbTask);
        }
        return;
      }
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGlobalTasks(tasks);
    });
    return () => unsub();
  }, []);

  // 2. Fetch User Specific Progress (Real-time)
  useEffect(() => {
    if (!user || !projectId) return;

    const docRef = doc(db, "user_project_progress", `${user.uid}_${projectId}`);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletedTaskIds(docSnap.data().completedTasks || []);
      } else {
        setCompletedTaskIds([]);
      }
      setInitialDataLoaded(true);
    }, (error) => {
      console.error("Error fetching progress sync:", error);
    });

    return () => unsub();
  }, [user, projectId]);

  // 3. Fetch Project Repo Settings
  useEffect(() => {
    if (!projectId) return;
    const unsub = onSnapshot(doc(db, "projects", projectId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.repoUrl) {
          setProjectRepo({
            url: data.repoUrl,
            type: data.repoType || 'github',
            token: data.repoToken
          });
        }
        setStagnancyLimit(data.stagnancyLimitHours || 24);
      }
    });
    return () => unsub();
  }, [projectId]);

  // 3. User Toggle Progress Logic
  const toggleItem = (id: string, currentlyCompleted: boolean) => {
    if (isManageMode) return; // Disable toggle when managing
    let nextIds = [];
    if (currentlyCompleted) {
      nextIds = completedTaskIds.filter(taskId => taskId !== id);
    } else {
      nextIds = [...completedTaskIds, id];
    }
    setCompletedTaskIds(nextIds);
    syncProgressThrottled(nextIds);
  };

  const syncProgressThrottled = async (nextIds: string[]) => {
    if (!user || !initialDataLoaded || globalTasks.length === 0) return;
    setIsSyncing(true);
    try {
      const currentPercent = Math.round((nextIds.length / globalTasks.length) * 100);
      const progressRef = doc(db, "user_project_progress", `${user.uid}_${projectId}`);
      
      await setDoc(progressRef, { 
        userId: user.uid,
        projectId,
        progress: currentPercent,
        completedTasks: nextIds,
        lastActive: serverTimestamp(),
        status: currentPercent === 100 ? "Done" : "Active"
      }, { merge: true });

      // Also Update User Global Summary for Consistency
      await updateUserProgress(user.uid, currentPercent);
      // toast.success("Progress safely saved to cloud", { id: "sync-toast" });
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to save progress");
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Admin Helpers for Manage Tasks Mode
  const handleAddNewLaunch = () => {
    setIsCreating(true);
    setEditingId("NEW");
    setEditForm({
      id: "task-" + Date.now(),
      title: "",
      description: "",
      category: "Environment"
    });
  };

  const handleEditTaskLaunch = (task: any) => {
    setIsCreating(false);
    setEditingId(task.id);
    setEditForm({ ...task });
  };

  const handleSaveTask = async () => {
    if (!editForm.title || !editForm.description) {
      toast.error("Title and description are required.");
      return;
    }
    // Using toast.promise instead to make it sleek
    const savePromise = setDoc(doc(db, "global_tasks", editForm.id), {
      id: editForm.id,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category
    });

    try {
      await savePromise;
      toast.success(isCreating ? "Task created!" : "Task updated!");
      setEditingId(null);
    } catch(err) {
      toast.error("Database save failed.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Are you sure you want to delete this global task?")) {
      await deleteDoc(doc(db, "global_tasks", id));
      toast.success("Task permanently deleted.");
    }
  };

  // Derive final list
  const filteredTasks = globalTasks.filter((item: any) => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: globalTasks.length,
    completed: completedTaskIds.length,
    percent: globalTasks.length > 0 ? Math.round((completedTaskIds.length / globalTasks.length) * 100) : 0
  };

  // Internal DOM Builder for Inline Task Editor
  const renderAdminTaskEditor = () => (
    <div className="p-6 rounded-3xl border border-indigo-500/50 bg-zinc-900 shadow-xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full" />
      <div className="space-y-3 relative z-10">
        <div>
          <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Title</label>
          <input 
            value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none transition-all"
            placeholder="e.g. Docker Configuration"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Description</label>
          <textarea 
            value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none transition-all"
            rows={2} placeholder="Explain what developers need to do..."
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Category</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Environment", "Standards", "Workflow"].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setEditForm({ ...editForm, category: cat })}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  editForm.category === cat 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/50 relative z-10">
        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSaveTask} className="flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
          <Save className="w-3.5 h-3.5" /> Save Task
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
            <Sparkles className="w-3.5 h-3.5" />
            Developer Path
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter">Engineering Checklist</h1>
          <p className="text-zinc-400 text-sm font-medium italic max-w-sm">Complete these checkpoints to align with core standards.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          {/* ... existing sync indicator ... */}
          
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800/50 px-4 py-2.5 rounded-2xl w-full md:w-64 focus-within:border-indigo-500/50 transition-all duration-300">
            <Search className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-600 w-full font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isAdmin && (
            <button 
              onClick={() => {
                setIsManageMode(!isManageMode);
                setEditingId(null);
              }}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-300 shadow-xl active:scale-95 ${
                isManageMode 
                  ? "bg-zinc-800 text-white border border-zinc-700" 
                  : "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20"
              }`}
            >
              {isManageMode ? <X className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
              {isManageMode ? "Exit Admin Mode" : "Manage Tasks"}
            </button>
          )}
        </div>
      </header>

      {/* Progress Overview */}
      {!isManageMode && (
        <section className="glass p-0.5 md:p-1 rounded-[2rem] md:rounded-[2.5rem] border-zinc-800/30 overflow-hidden">
          <div className="glass bg-zinc-950/40 p-6 md:p-10 rounded-[1.8rem] md:rounded-[2.3rem] flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-900" />
                <circle
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * stats.percent) / 100}
                  strokeLinecap="round"
                  className="text-indigo-500 shadow-xl shadow-indigo-500/50 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-white">{stats.percent}%</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-2xl font-black text-white tracking-tight">Onboarding Completion</h2>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                You are currently on track. Complete the remaining {stats.total - stats.completed} tasks to unlock the &quot;Independent Contributor&quot; status.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                  <CheckSquare className="w-4 h-4" /> {stats.completed} Done
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold">
                  <Terminal className="w-4 h-4" /> {stats.total} Total
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Admin Quick Add Action */}
      {isManageMode && !editingId && (
        <button 
          onClick={handleAddNewLaunch}
          className="w-full border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/70 hover:bg-indigo-500/5 bg-transparent rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-indigo-400 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-tight">Add New Global Task</span>
        </button>
      )}

      {/* Inline Editor for New Task if applicable */}
      {isManageMode && editingId === "NEW" && renderAdminTaskEditor()}

      {/* Task List Grid grouped by Category */}
      <div className="grid grid-cols-1 gap-12">
        
        {/* Environment Group */}
        {filteredTasks.some((t: any) => t.category === "Environment") && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Cpu className="w-6 h-6 text-indigo-400" /></div>
              <h3 className="text-3xl font-black text-white tracking-tight">Environment Setup</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.filter((t: any) => t.category === "Environment").map((item: any) => (
                editingId === item.id ? (
                  <div key={item.id}>{renderAdminTaskEditor()}</div>
                ) : (
                  <div key={item.id} className="relative group">
                    <ChecklistItem 
                      id={item.id} title={item.title} description={item.description} category={item.category}
                      completed={completedTaskIds.includes(item.id)} onToggle={(id) => toggleItem(id, completedTaskIds.includes(id))}
                      validationType={item.validationType} validationCriteria={item.validationCriteria} projectRepo={projectRepo}
                    />
                    {isManageMode && (
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden pointer-events-auto z-20">
                        <button onClick={() => handleEditTaskLaunch(item)} className="p-2 hover:bg-indigo-500/20 hover:text-indigo-400 text-zinc-400 transition"><Edit2 className="w-3.5 h-3.5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(item.id); }} className="p-2 border-l border-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Standards Group */}
        {filteredTasks.some((t: any) => t.category === "Standards") && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-amber-500/10 rounded-xl"><Layers className="w-6 h-6 text-amber-400" /></div>
              <h3 className="text-3xl font-black text-white tracking-tight">Coding Standards</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.filter((t: any) => t.category === "Standards").map((item: any) => (
                editingId === item.id ? (
                  <div key={item.id}>{renderAdminTaskEditor()}</div>
                ) : (
                  <div key={item.id} className="relative group">
                    <ChecklistItem 
                      id={item.id} title={item.title} description={item.description} category={item.category}
                      completed={completedTaskIds.includes(item.id)} onToggle={(id) => toggleItem(id, completedTaskIds.includes(id))}
                      validationType={item.validationType} validationCriteria={item.validationCriteria} projectRepo={projectRepo}
                    />
                    {isManageMode && (
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden pointer-events-auto z-20">
                        <button onClick={() => handleEditTaskLaunch(item)} className="p-2 hover:bg-indigo-500/20 hover:text-indigo-400 text-zinc-400 transition"><Edit2 className="w-3.5 h-3.5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(item.id); }} className="p-2 border-l border-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Workflow Group */}
        {filteredTasks.some((t: any) => t.category === "Workflow") && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl"><GitBranch className="w-6 h-6 text-emerald-400" /></div>
              <h3 className="text-3xl font-black text-white tracking-tight">Team Workflow</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.filter((t: any) => t.category === "Workflow").map((item: any) => (
                editingId === item.id ? (
                  <div key={item.id}>{renderAdminTaskEditor()}</div>
                ) : (
                  <div key={item.id} className="relative group">
                    <ChecklistItem 
                      id={item.id} title={item.title} description={item.description} category={item.category}
                      completed={completedTaskIds.includes(item.id)} onToggle={(id) => toggleItem(id, completedTaskIds.includes(id))}
                      validationType={item.validationType} validationCriteria={item.validationCriteria} projectRepo={projectRepo}
                    />
                    {isManageMode && (
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden pointer-events-auto z-20">
                        <button onClick={() => handleEditTaskLaunch(item)} className="p-2 hover:bg-indigo-500/20 hover:text-indigo-400 text-zinc-400 transition"><Edit2 className="w-3.5 h-3.5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(item.id); }} className="p-2 border-l border-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
