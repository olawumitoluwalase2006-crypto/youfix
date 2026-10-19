"use client";

import React, { useState } from "react";
import { Wrench, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Zap, Droplets, Disc, Flame } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisLoading } from "@/components/AnalysisLoading";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { SampleSelector } from "@/components/SampleSelector";
import { diagnoseImageFile, diagnoseSample } from "@/lib/api";
import { DiagnosisRecord, SampleProblem } from "@/lib/types";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await diagnoseImageFile(file);
      setDiagnosis(result);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setErrorMsg(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sample: SampleProblem) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await diagnoseSample(sample.thumbnail, sample.category);
      setDiagnosis(result);
    } catch (err: any) {
      console.error("Sample diagnosis error:", err);
      setErrorMsg(err.message || "Failed to process sample image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* If a diagnosis result is present, display it */}
      {diagnosis ? (
        <DiagnosisResult diagnosis={diagnosis} onReset={handleReset} />
      ) : isLoading ? (
        <AnalysisLoading />
      ) : (
        /* Landing & Upload View */
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Gemini Vision Powered Capstone Project</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Diagnose Physical Faults.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
                Fix Safely.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Snap or upload a photo of a household or automotive breakdown. YouFix strictly classifies the fault, evaluates life-safety hazard levels, and delivers an instant DIY protocol or certified professional referral.
            </p>

            {/* Core Domain Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Leaking Pipe
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                Clogged Drain
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-rose-700 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-rose-600" />
                Damaged Electrical Socket
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-amber-700 shadow-xs">
                <Disc className="w-3.5 h-3.5 text-amber-600" />
                Flat Tire
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-orange-700 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Overheating Engine
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs px-3 py-1 rounded-lg bg-rose-200 text-rose-900 font-bold hover:bg-rose-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Upload Zone */}
          <div className="max-w-3xl mx-auto">
            <UploadZone onFileSelected={handleFileUpload} isLoading={isLoading} />
          </div>

          {/* Quick 1-Click Samples for Evaluators */}
          <div className="max-w-4xl mx-auto pt-6 border-t border-slate-200/80">
            <SampleSelector onSelectSample={handleSelectSample} isLoading={isLoading} />
          </div>

          {/* Architecture & Safety Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto pt-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Multimodal Gemini Vision</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts physical wear, thermal discoloration, fluid leaks, and mechanical puncture artifacts with zero hallucinations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Enforced Safety Guardrails</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Damaged sockets and boiling engines automatically lock out DIY instructions to eliminate electrocution and burn hazards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">PostgreSQL Persistence</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Diagnoses and images are stored to Supabase with real-time audit logs and history querying.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
