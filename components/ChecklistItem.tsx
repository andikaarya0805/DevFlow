"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, GitBranch, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyGitTask } from "@/lib/git";
import toast from "react-hot-toast";

interface ChecklistItemProps {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: "Environment" | "Standards" | "Workflow";
  onToggle: (id: string, completed: boolean) => void;
  // Git Validation Props
  validationType?: 'branch' | 'pr';
  validationCriteria?: string;
  projectRepo?: {
    url: string;
    type: 'github' | 'gitlab';
    token?: string;
  };
}

export default function ChecklistItem({
  id,
  title,
  description,
  completed,
  category,
  onToggle,
  validationType,
  validationCriteria,
  projectRepo
}: ChecklistItemProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!validationType || !validationCriteria || !projectRepo?.url) {
      toast.error("Git configuration missing for this task.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyGitTask(
        projectRepo.type,
        projectRepo.url,
        projectRepo.token,
        validationType,
        validationCriteria
      );

      if (result.success) {
        toast.success(result.message);
        onToggle(id, true);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Verification failed. Please check your repo settings.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div 
      className={cn(
        "group relative p-6 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden bg-zinc-900/40",
        completed 
          ? "border-emerald-500/30 bg-emerald-500/[0.02] opacity-70" 
          : "border-zinc-800/50 hover:border-indigo-500/30 hover:bg-zinc-800/40"
      )}
      onClick={() => !validationType && onToggle(id, !completed)}
    >
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute -right-8 -top-8 w-24 h-24 blur-[60px] rounded-full transition-all duration-700 opacity-0 group-hover:opacity-20",
        completed ? "bg-emerald-500 opacity-10" : "bg-indigo-500"
      )} />

      <div className="flex items-start gap-5 relative z-10">
        <div className="flex-shrink-0 mt-1">
          {completed ? (
            <div className="p-1.5 bg-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          ) : (
            <div className="p-1.5 bg-zinc-800 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
              {validationType ? (
                <GitBranch className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "font-bold tracking-tight transition-colors",
              completed ? "text-emerald-400/80 line-through" : "text-white group-hover:text-indigo-300"
            )}>
              {title}
            </h4>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border",
              category === "Environment" ? "border-indigo-500/20 text-indigo-400 bg-indigo-500/5" :
              category === "Standards" ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
              "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
            )}>
              {category}
            </span>
          </div>
          <p className={cn(
            "text-xs leading-relaxed font-medium transition-colors",
            completed ? "text-zinc-600 italic" : "text-zinc-500 group-hover:text-zinc-400"
          )}>
            {description}
          </p>
          
          <div className="pt-2 flex items-center justify-between">
            {completed ? (
              <div className="text-[10px] font-bold text-emerald-500/60 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Verified Complete
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <div className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-indigo-400/60 transition-colors">
                  <Clock className="w-3 h-3" />
                  Auto-verify {validationType === 'branch' ? 'Branch' : validationType === 'pr' ? 'PR' : 'Pipeline'}
                </div>
                
                {validationType && (
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <GitBranch className="w-3 h-3" />
                        Verify Now
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
