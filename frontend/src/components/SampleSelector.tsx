"use client";

import React from "react";
import { Droplets, Zap, Disc, Flame, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { SampleProblem, ProblemCategory } from "@/lib/types";

interface SampleSelectorProps {
  onSelectSample: (sample: SampleProblem) => void;
  isLoading: boolean;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: "sample-pipe",
    title: "Leaking Sink P-Trap",
    category: "Leaking pipe",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    description: "Continuous water dripping beneath kitchen cabinet basin.",
    expected_type: "DIY",
  },
  {
    id: "sample-socket",
    title: "Melted Wall Socket",
    category: "Damaged electrical socket",
    thumbnail: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80",
    description: "Severely charred faceplate and sparking contacts.",
    expected_type: "Professional",
  },
  {
    id: "sample-drain",
    title: "Blocked Bathroom Drain",
    category: "Clogged drain",
    thumbnail: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
    description: "Standing murky water refusing to drain past stopper.",
    expected_type: "DIY",
  },
  {
    id: "sample-tire",
    title: "Nail Puncture in Tread",
    category: "Flat tire",
    thumbnail: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80",
    description: "Loss of air pressure with visible nail head embedded.",
    expected_type: "DIY",
  },
  {
    id: "sample-engine",
    title: "Radiator Steam Boilover",
    category: "Overheating engine",
    thumbnail: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
    description: "White steam billowing from engine bay and high temp gauge.",
    expected_type: "Professional",
  },
];

export const SampleSelector: React.FC<SampleSelectorProps> = ({ onSelectSample, isLoading }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Or Test with 1-Click Capstone Demo Scenarios:
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">5 Core Problem Domains</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SAMPLE_PROBLEMS.map((sample) => {
          const isPro = sample.expected_type === "Professional";

          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              disabled={isLoading}
              className="group relative flex flex-col text-left p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden disabled:opacity-50"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 right-1.5">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm ${
                      isPro
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {isPro ? "Pro Required" : "DIY Solvable"}
                  </span>
                </div>
              </div>

              {/* Title & Category */}
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {sample.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {sample.description}
                </p>
              </div>

              {/* Action hint */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:text-blue-600">
                <span>Test Diagnosis</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
