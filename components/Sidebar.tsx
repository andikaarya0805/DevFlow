"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { 
  BarChart3, 
  CheckSquare, 
  Users, 
  FileTerminal, 
  LogOut,
  Infinity,
  Zap,
  Share2,
  Copy,
  Layout,
  ChevronDown,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { auth, signOut, db, doc, onSnapshot, query, collection, where } from "@/lib/firebase";
import { getUserProjects } from "@/lib/project";
import toast from "react-hot-toast";

const menuItems = [
  { name: "Dashboard", icon: BarChart3, path: "/dashboard", adminOnly: true },
  { name: "My Checklist", icon: CheckSquare, path: "/checklist" },
  { name: "Team Progress", icon: Users, path: "/team", adminOnly: true },
  { name: "Code Standards", icon: FileTerminal, path: "/standards" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { user, role } = useAuth();
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setUserProjects([]);
      setProjectData(null);
      return;
    }

    // 1. Real-time User's Projects
    // Using onSnapshot ensures the list updates immediately when joining/creating projects
    const q = query(collection(db, "projects"), where("members", "array-contains", user.uid));
    const unsubProjects = onSnapshot(q, (snapshot: any) => {
      const projects = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      setUserProjects(projects);
    });

    // 2. Fetch Current Project Details if projectId is set
    let unsubProjectDetails = () => {};
    if (projectId) {
      const docRef = doc(db, "projects", projectId);
      unsubProjectDetails = onSnapshot(docRef, (docSnap: any) => {
        if (docSnap.exists()) {
          setProjectData(docSnap.data());
        }
      });
    }

    return () => {
      unsubProjects();
      unsubProjectDetails();
    };
  }, [user?.uid, projectId]);

  const switchProject = (newId: string) => {
    setIsDropdownOpen(false);
    router.push(`${pathname}?projectId=${newId}`);
  };

  const handleShare = () => {
    if (!projectData?.inviteCode) {
      toast.error("Visit a project dashboard to share.");
      return;
    }
    
    const url = `${window.location.origin}/join/${projectData.inviteCode}`;
    navigator.clipboard.writeText(url);
    setIsCopying(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950 border-r border-zinc-800/50 flex flex-col h-screen transition-all duration-300 relative group/sidebar">
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Infinity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white leading-none">DevFlow</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
               <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-black text-indigo-400 flex-shrink-0">
                  {projectData?.name?.charAt(0) || "P"}
               </div>
               <span className="text-xs font-bold text-zinc-200 truncate">{projectData?.name || "Select Project"}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-zinc-600 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-3 pb-2 mb-2 border-b border-zinc-800 flex flex-col">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Your Workspaces</span>
              </div>
              <div className="max-h-48 overflow-y-auto px-2 space-y-1">
                {userProjects.map((proj) => (
                  <button 
                    key={proj.id}
                    onClick={() => switchProject(proj.id)}
                    className={cn(
                      "flex items-center gap-2 w-full p-2.5 rounded-lg text-xs font-bold transition-all",
                      projectId === proj.id 
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded bg-zinc-800 flex items-center justify-center text-[8px]",
                      projectId === proj.id && "bg-indigo-600 text-white"
                    )}>
                      {proj.name.charAt(0)}
                    </div>
                    {proj.name}
                  </button>
                ))}
              </div>
              <div className="px-2 pt-2 mt-2 border-t border-zinc-800">
                 <Link 
                   href="/" 
                   className="flex items-center gap-2 w-full p-2.5 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all"
                   onClick={() => setIsDropdownOpen(false)}
                 >
                   <Plus className="w-4 h-4" /> Create New
                 </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item) => {
          if (item.adminOnly && role !== "admin") return null;
          
          return (
            <Link
              key={item.path}
              href={projectId ? `${item.path}?projectId=${projectId}` : item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group hover:bg-zinc-800/40",
                pathname === item.path 
                  ? "bg-zinc-800/80 text-white shadow-sm border border-zinc-700/50" 
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                pathname === item.path ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"
              )} />
              {item.name}
              {pathname === item.path && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2 border-t border-zinc-800/50">
        {role === "admin" && projectData && (
           <button 
              onClick={handleShare}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-indigo-600/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-600/20 transition-all duration-300 group"
           >
             {isCopying ? <Copy className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
             {isCopying ? "Copied!" : "Share Project"}
           </button>
        )}

        {user ? (
          <div className="flex items-center gap-3 px-2 py-4 border-t border-zinc-800/30">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border border-zinc-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 font-extrabold">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-200 truncate w-32" title={user.displayName || "User"}>{user.displayName}</span>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tight">{role}</span>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 rounded-2xl mb-4 bg-indigo-950/20 border-indigo-500/20 text-center">
            <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-[10px] text-zinc-400 leading-relaxed font-bold uppercase tracking-widest">
              Ready to automate.
            </p>
          </div>
        )}

        <button 
          onClick={async () => {
             await signOut(auth);
             toast.success("Signed out successfully");
             router.push("/");
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-500 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
