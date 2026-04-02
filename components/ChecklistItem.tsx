"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, doc, updateDoc } from "@/lib/firebase";

interface ChecklistItemProps {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: "Environment" | "Standards" | "Workflow";
  onToggle: (id: string, completed: boolean) => void;
}

export default function ChecklistItem({
  id,
  title,
  description,
  completed,
  category,
  onToggle
}: ChecklistItemProps) {
  return (
    <div 
      className={cn(
        "group relative p-6 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden bg-zinc-900/40",
        completed 
          ? "border-emerald-500/30 bg-emerald-500/[0.02] opacity-70" 
          : "border-zinc-800/50 hover:border-indigo-500/30 hover:bg-zinc-800/40"
      )}
      onClick={() => onToggle(id, !completed)}
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
              <Circle className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
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
          
          <div className="pt-2 flex items-center gap-3">
            {completed ? (
              <div className="text-[10px] font-bold text-emerald-500/60 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Verified Complete
              </div>
            ) : (
              <div className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-indigo-400/60 transition-colors">
                <Clock className="w-3 h-3" />
                Estimated 15m
                <div className="w-1 h-1 rounded-full bg-zinc-800 mx-1" />
                Priority High
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Interaction Ripple Effect (Subtle) */}
      <div className={cn(
        "absolute inset-0 bg-white/5 opacity-0 active:opacity-100 transition-opacity duration-100 pointer-events-none",
        completed && "hidden"
      )} />
    </div>
  );
}
