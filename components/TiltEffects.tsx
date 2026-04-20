"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

// ─── 3D Tilt Card ──────────────────────────────────────────────────────────
export const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)" }}>{children}</div>
    </motion.div>
  );
};

// ─── Typewriter Terminal Effect ─────────────────────────────────────────────
export const TypewriterTerminal = ({ lines }: { lines: string[] }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      setIsDone(true);
      return;
    }

    let i = 0;
    const line = lines[currentLineIndex];
    const interval = setInterval(() => {
      setCurrentText(line.substring(0, i + 1));
      i++;
      if (i >= line.length) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [currentLineIndex, lines]);

  return (
    <div className="font-mono space-y-1">
      {lines.slice(0, currentLineIndex).map((line, idx) => (
        <div key={idx} className="flex gap-2">
            <span className="text-emerald-500">✔</span> {line}
        </div>
      ))}
      <div className="flex gap-2">
        {!isDone && <span className="text-zinc-500">$</span>}
        <span>{currentText}</span>
        {!isDone && <span className="w-2 h-4 bg-white animate-pulse" />}
      </div>
    </div>
  );
};
