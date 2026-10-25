"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ShieldAlert, History, Activity, Sparkles, CheckCircle2 } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    checkBackendHealth()
      .then((res) => {
        if (mounted) {
          setBackendStatus(res.connected ? "online" : "offline");
        }
      })
      .catch(() => {
        if (mounted) setBackendStatus("offline");
      });

    const interval = setInterval(() => {
      checkBackendHealth().then((res) => {
        if (mounted) setBackendStatus(res.connected ? "online" : "offline");
      });
    }, 20000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Diagnose", icon: Sparkles },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              YouFix<span className="text-blue-600">.</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 -mt-1">
              AI Fault Diagnostics
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Tool Rush Game Link & Backend Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cyber-Workshop Game Link */}
          <a
            href="https://you-fix-tool-rush.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black text-cyan-950 bg-gradient-to-r from-cyan-400/20 via-teal-400/25 to-cyan-500/20 hover:from-cyan-400/35 hover:via-teal-400/40 hover:to-cyan-500/35 border border-cyan-400/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            title="Launch Tool Rush interactive game in new tab"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base leading-none">🎮</span>
              <span className="tracking-tight bg-gradient-to-r from-cyan-800 via-teal-800 to-cyan-900 bg-clip-text text-transparent font-black">
                Play Tool Rush
              </span>
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          </a>

          {/* Backend Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-400 animate-ping"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-slate-600">API:</span>
              <span
                className={`font-semibold ${
                  backendStatus === "online"
                    ? "text-emerald-700"
                    : backendStatus === "checking"
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {backendStatus === "online"
                  ? "Connected"
                  : backendStatus === "checking"
                  ? "Connecting..."
                  : "Standalone"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
