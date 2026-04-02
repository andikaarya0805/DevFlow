"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, Infinity, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { db, doc, getDoc } from "@/lib/firebase";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");

  // Hide shell on landing, login, and join pages
  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname.startsWith("/join");

  useEffect(() => {
    const fetchProjectName = async () => {
      if (projectId) {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProjectName(docSnap.data().name);
        }
      }
    };
    fetchProjectName();
  }, [projectId]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, searchParams]);

  if (isPublicRoute) return <>{children}</>;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-200">
      {/* Drawer Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-[101]"
            >
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-3 md:px-8 glass border-b border-zinc-800/50 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors group shrink-0"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium overflow-hidden whitespace-nowrap">
              <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20 shrink-0">
                <Infinity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden sm:block text-zinc-500">DevFlow</span>
              {projectName && (
                <>
                  <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                  <span className="text-zinc-200 font-bold truncate max-w-[100px] md:max-w-[200px]">{projectName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
             <div className="hidden sm:block h-8 w-[1px] bg-zinc-800/50 mx-2" />
             {user && (
               <div className="flex items-center gap-2">
                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs font-bold text-zinc-200">{user.displayName || "User"}</span>
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">Active Workspace</span>
                 </div>
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-zinc-800" />
                 ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                 )}
               </div>
             )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
