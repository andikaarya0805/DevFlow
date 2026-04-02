import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  variant?: "default" | "warning" | "error" | "success";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default"
}: StatCardProps) {
  const variants = {
    default: "border-zinc-800/50 hover:border-zinc-700/50",
    warning: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30",
    error: "border-red-500/20 bg-red-500/5 hover:border-red-500/30",
    success: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30",
  };

  const iconColors = {
    default: "text-zinc-500",
    warning: "text-amber-500",
    error: "text-red-500",
    success: "text-emerald-500",
  };

  return (
    <div className={cn(
      "glass-card p-6 rounded-3xl transition-all duration-500 relative overflow-hidden group",
      variants[variant]
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 group-hover:scale-110 transition-transform duration-500",
          iconColors[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full border bg-zinc-950/50",
            trend.isUp ? "text-emerald-500 border-emerald-500/20" : "text-red-500 border-red-500/20"
          )}>
            {trend.isUp ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-medium">{description}</p>
      </div>
      
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute -bottom-8 -right-8 w-24 h-24 blur-3xl opacity-10 rounded-full",
        variant === "error" ? "bg-red-500" : variant === "warning" ? "bg-amber-500" : "bg-indigo-500"
      )} />
    </div>
  );
}
