"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Zap, Loader2 } from "lucide-react";
import { generateDebtInsights, DebtInsight } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface AIInsightsProps {
  teamProgress: any[];
  technicalDebts: any[];
}

export default function AIInsights({ teamProgress, technicalDebts }: AIInsightsProps) {
  const [insights, setInsights] = useState<DebtInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await generateDebtInsights(teamProgress, technicalDebts);
      setInsights(data);
    } catch (error) {
      console.error("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamProgress.length > 0) {
      fetchInsights();
    }
  }, [teamProgress]);

  return (
    <div className="glass p-8 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/[0.02] space-y-6 relative overflow-hidden group">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400 group-hover:animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">AI Engineering Insights</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Powered by Gemini Pro</p>
          </div>
        </div>
        
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-all active:scale-95 text-zinc-500 hover:text-indigo-400"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Analyzing Team Velocity...</p>
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="glass bg-zinc-950/40 p-5 rounded-3xl border-zinc-800/50 hover:border-indigo-500/30 transition-all duration-500 group/item"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "mt-1 p-2 rounded-xl",
                  insight.priority === 'High' ? "bg-red-500/10 text-red-400" :
                  insight.priority === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                  "bg-emerald-500/10 text-emerald-400"
                )}>
                  {insight.priority === 'High' ? <AlertCircle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white tracking-tight">{insight.title}</h4>
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        insight.priority === 'High' ? "border-red-500/20 text-red-500 bg-red-500/5" :
                        insight.priority === 'Medium' ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                        "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                    )}>
                        {insight.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{insight.description}</p>
                  
                  <div className="pt-3 flex items-start gap-2 border-t border-zinc-800/30 mt-3 group-hover/item:border-indigo-500/20 transition-colors">
                    <CheckCircle className="w-3 h-3 text-indigo-400 mt-0.5" />
                    <p className="text-[11px] text-indigo-300/80 font-bold italic leading-tight">
                        {insight.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-zinc-800 rounded-[2rem]">
             <Sparkles className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
             <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">No Insights Generated Yet</p>
             <button onClick={fetchInsights} className="mt-4 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Run AI Analysis</button>
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between relative z-10">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800" />
            ))}
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Insights based on latest 50 activities</span>
      </div>
    </div>
  );
}
