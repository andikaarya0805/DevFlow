"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModernConfirm({
  isOpen,
  title,
  message,
  type = "info",
  onConfirm,
  onCancel
}: ModernConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass bg-zinc-950/80 border border-zinc-800 shadow-2xl rounded-[2.5rem] p-8 overflow-hidden"
          >
            {/* Accent Glow */}
            <div className={cn(
              "absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20",
              type === "danger" ? "bg-red-500" : "bg-indigo-500"
            )} />

            <div className="relative z-10 space-y-6 text-center">
              {/* Icon */}
              <div className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-2xl",
                type === "danger" ? "bg-red-500/10 text-red-500 shadow-red-500/10" : "bg-indigo-500/10 text-indigo-500 shadow-indigo-500/10"
              )}>
                {type === "danger" ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed px-4">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    "flex-1 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white rounded-2xl shadow-xl transition-all active:scale-95",
                    type === "danger" 
                        ? "bg-red-600 hover:bg-red-500 shadow-red-600/20" 
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                  )}
                >
                  Confirm Action
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button 
                onClick={onCancel}
                className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-xl transition-all"
            >
                <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
