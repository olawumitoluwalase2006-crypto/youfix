import React from "react";
import { ShieldCheck, Cpu, Code2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-bold text-base">
              <span>YouFix Capstone Project</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Full-Stack AI Fault Diagnosis & Safety Protocol Engine powered by Next.js, FastAPI, Supabase, and Google Gemini Vision.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Gemini Vision Multimodal
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              FastAPI + Supabase
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Safety-First Protocols
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} YouFix. Built for Capstone Evaluation.</p>
          <p className="text-[11px] text-slate-400">
            Safety Warning: Always verify power is cut before inspecting electrical systems and never open a hot radiator.
          </p>
        </div>
      </div>
    </footer>
  );
};
