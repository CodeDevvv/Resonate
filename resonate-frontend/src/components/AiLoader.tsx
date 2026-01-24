"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Dna, FlaskConical, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

type AiLoaderProps = {
  text?: string;
  subtext?: string;
  variant?: "flask-bubbling" | "icon-cycle";
};

const BubblingFlask = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-16 h-16 text-primary relative z-10"
      >
        <path
          d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"
          className="stroke-primary"
        />
        <path d="M8.5 2h7" className="stroke-primary" />

        <motion.path
          d="M6 18h12"
          initial={{ pathLength: 0, opacity: 0, y: 5 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 1, 1, 0],
            y: [5, 0, 0, -5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="stroke-primary fill-primary/30"
          strokeWidth="0"
          fill="currentColor"
        />

        <motion.circle
          cx="12" cy="14" r="1"
          className="fill-primary stroke-none"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -10, opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.circle
          cx="10" cy="16" r="1.5"
          className="fill-primary stroke-none"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -12, opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
          cx="14" cy="15" r="1"
          className="fill-primary stroke-none"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -8, opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
        />
      </svg>
    </div>
  );
};

const icons = [
  { icon: Brain, color: "text-rose-500", label: "Thinking" },
  { icon: Dna, color: "text-blue-500", label: "Analyzing" },
  { icon: FlaskConical, color: "text-amber-500", label: "Processing" },
  { icon: Sparkles, color: "text-purple-500", label: "Generating" },
];

const IconCycle = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % icons.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = icons[index].icon;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center bg-muted rounded-full border border-border shadow-inner">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
          transition={{ duration: 0.4 }}
          className={`absolute ${icons[index].color}`}
        >
          <CurrentIcon className="w-10 h-10" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 animate-spin-slow">
        <div className="w-full h-full rounded-full border border-dashed border-primary/30" />
      </div>
    </div>
  );
};

const AiLoader: React.FC<AiLoaderProps> = ({
  text = "AI is working...",
  subtext = "This may take a moment",
  variant = "icon-cycle"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 text-center animate-in fade-in duration-500">

      {variant === "flask-bubbling" ? <BubblingFlask /> : <IconCycle />}

      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center justify-center gap-2">
          {text}
          <span className="flex">
            <span className="animate-bounce delay-0">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </span>
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subtext}
        </p>
      </div>
    </div>
  );
};

export default AiLoader;