"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ScanEye, ShieldAlert, Cpu, Wrench } from "lucide-react";

export const AnalysisLoading: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { title: "Uploading image & verifying payload", icon: Sparkles },
    { title: "Gemini Vision multimodal inference in progress", icon: ScanEye },
    { title: "Strict classification into 5 target problem categories", icon: Cpu },
    { title: "Evaluating hazard risk levels & safety parameters", icon: ShieldAlert },
    { title: "Synthesizing step-by-step repair protocol", icon: Wrench },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Animated Glowing AI Orb */}
      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-blue-600 animate-spin-slow" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <ScanEye className="w-8 h-8 animate-bounce" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          YouFix AI Diagnostic Engine
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Processing visual indicators using Google Gemini Vision API...
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="space-y-3 text-left">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? "bg-blue-50/90 border border-blue-200 text-blue-900 shadow-sm"
                  : isDone
                  ? "text-emerald-700 bg-emerald-50/50"
                  : "text-slate-400 opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white animate-pulse"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>

              <div className="flex-1 flex items-center justify-between">
                <span className={`text-xs font-semibold ${isCurrent ? "font-bold" : ""}`}>
                  {step.title}
                </span>
                <Icon
                  className={`w-4 h-4 ${
                    isCurrent ? "text-blue-600 animate-spin" : isDone ? "text-emerald-600" : "text-slate-300"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pulsing Loading Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
