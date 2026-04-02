import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export default function ProgressBar({
  label,
  value,
  max = 100,
  className,
  size = "md",
  showValue = true
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const getBarColor = (val: number) => {
    if (val < 40) return "bg-red-500 shadow-red-500/20";
    if (val < 75) return "bg-amber-500 shadow-amber-500/20";
    return "bg-emerald-500 shadow-emerald-500/20";
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center px-1">
        <span className="text-sm font-bold text-zinc-300">{label}</span>
        {showValue && (
          <span className={cn(
            "text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800",
            percentage < 40 ? "text-red-400" : percentage < 75 ? "text-amber-400" : "text-emerald-400"
          )}>
            {percentage}%
          </span>
        )}
      </div>
      <div className={cn(
        "w-full bg-zinc-900 border border-zinc-800/50 rounded-full overflow-hidden p-0.5",
        sizes[size]
      )}>
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out shadow-lg",
            getBarColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
