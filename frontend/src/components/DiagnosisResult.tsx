"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  PhoneCall,
  Printer,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Flame,
  Zap,
  Droplets,
  Disc,
} from "lucide-react";
import { DiagnosisRecord, ProblemCategory, RiskLevel } from "@/lib/types";

interface DiagnosisResultProps {
  diagnosis: DiagnosisRecord;
  onReset: () => void;
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, onReset }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Category Icon & Color Mapping
  const getCategoryMeta = (cat: ProblemCategory) => {
    switch (cat) {
      case "Leaking pipe":
        return {
          icon: Droplets,
          badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
          domain: "Plumbing",
        };
      case "Clogged drain":
        return {
          icon: Droplets,
          badgeBg: "bg-cyan-100 text-cyan-800 border-cyan-200",
          domain: "Plumbing",
        };
      case "Damaged electrical socket":
        return {
          icon: Zap,
          badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
          domain: "Electrical",
        };
      case "Flat tire":
        return {
          icon: Disc,
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
          domain: "Automotive",
        };
      case "Overheating engine":
        return {
          icon: Flame,
          badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
          domain: "Automotive",
        };
      case "Invalid Image":
        return {
          icon: AlertTriangle,
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
          domain: "Verification Guardrail",
        };
      default:
        return {
          icon: Wrench,
          badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
          domain: "General",
        };
    }
  };

  // Risk Level color coding: Green for Low, Yellow/Amber for Medium, Red for High
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case "Low":
        return {
          label: "Low Risk",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
          dotClass: "bg-emerald-500",
          textClass: "text-emerald-700",
        };
      case "Medium":
        return {
          label: "Medium Risk",
          badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
          dotClass: "bg-yellow-500",
          textClass: "text-yellow-700",
        };
      case "High":
        return {
          label: "High Risk",
          badgeClass: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse",
          dotClass: "bg-rose-600",
          textClass: "text-rose-700",
        };
    }
  };

  const categoryMeta = getCategoryMeta(diagnosis.category);
  const CategoryIcon = categoryMeta.icon;
  const riskBadge = getRiskBadge(diagnosis.risk_level);

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = diagnosis.instructions?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold shadow-sm transition-all"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Diagnose Another Issue</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Main Diagnosis Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>YouFix AI Certified Assessment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {diagnosis.category}
              </h2>
            </div>

            {/* Badges: Category & Risk Level */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${categoryMeta.badgeBg}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                {diagnosis.category}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${riskBadge.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${riskBadge.dotClass}`} />
                {riskBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* CRITICAL WARNING / PROFESSIONAL REQUIRED / INVALID IMAGE BOX */}
          {diagnosis.category === "Invalid Image" ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-md shadow-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-black tracking-tight text-amber-900 uppercase">
                      ⚠️ Non-Repair Image Detected
                    </h3>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-200 text-amber-900">
                      Re-Upload Recommended
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-amber-900 mt-1">
                    {diagnosis.safety_warning ||
                      "The uploaded image does not appear to show a household or automotive fault."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-amber-200/80">
                <div className="text-xs text-amber-800 font-medium">
                  Please submit a clear, focused photo of a plumbing, electrical, or automotive problem.
                </div>
                <button
                  onClick={onReset}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all no-print"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Upload Another Photo</span>
                </button>
              </div>
            </div>
          ) : diagnosis.professional_required ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 shadow-md shadow-rose-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-black tracking-tight text-rose-900 uppercase">
                      ⚠️ Professional Intervention Required
                    </h3>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-rose-200 text-rose-900">
                      DO NOT ATTEMPT DIY REPAIR
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-rose-800 mt-1">
                    {diagnosis.safety_warning ||
                      "This fault presents immediate hazards to life, property, or catastrophic structural damage."}
                  </p>
                </div>
              </div>

              {/* Call to action for Professional */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-rose-200/80">
                <div className="text-xs text-rose-700">
                  <span className="font-bold">Next Safe Action:</span> Cut all power/ignition immediately, evacuate hazard area, and contact certified technician.
                </div>
                <a
                  href="tel:911"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all no-print"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Dispatch / Certified Pro</span>
                </a>
              </div>
            </div>
          ) : (
            /* DIY Eligible Banner */
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Safe for DIY Home / Field Repair
                  </h4>
                  <p className="text-xs text-emerald-700">
                    This fault can be resolved with standard tools. Follow safety precautions below.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                DIY Eligible
              </span>
            </div>
          )}

          {/* Image & Technical Cause Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Uploaded Image Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Visual Artifact
              </span>
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={diagnosis.image_url}
                  alt={diagnosis.category}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] text-white font-mono">
                  Analyzed by Gemini Vision
                </div>
              </div>
            </div>

            {/* Diagnostic Findings */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Delineated Root Cause
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {diagnosis.cause}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Immediate Recommended Action
                </span>
                <p className="text-sm font-semibold text-blue-900 mt-1 leading-relaxed bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                  {diagnosis.recommended_action}
                </p>
              </div>

              {/* General safety notice if present */}
              {diagnosis.safety_warning && !diagnosis.professional_required && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-bold">Safety Note:</strong> {diagnosis.safety_warning}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step-by-Step Instructions Protocol */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {diagnosis.category === "Invalid Image"
                    ? "Photo Submission Recommendations"
                    : diagnosis.is_diy
                    ? "Step-by-Step DIY Repair Protocol"
                    : "Safe Isolation & Pre-Professional Steps"}
                </h3>
                <p className="text-xs text-slate-500">
                  {diagnosis.category === "Invalid Image"
                    ? "Follow these tips to get an accurate AI fault assessment."
                    : diagnosis.is_diy
                    ? "Check off each step as you complete it safely."
                    : "Follow these containment steps until certified personnel arrive."}
                </p>
              </div>

              {diagnosis.is_diy && totalSteps > 0 && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 no-print">
                  <span>Progress: {progressPercent}%</span>
                  <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {diagnosis.instructions && diagnosis.instructions.length > 0 ? (
                diagnosis.instructions.map((step, idx) => {
                  const isChecked = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-emerald-50/60 border-emerald-300 text-slate-600 line-through opacity-75"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 text-sm font-medium leading-relaxed">
                        <span className="font-bold text-slate-900 mr-1.5 not-sr-only">
                          Step {idx + 1}:
                        </span>
                        {step.replace(/^Step \d+:\s*/i, "")}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic">No specific step instructions recorded.</p>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Diagnosed on {new Date(diagnosis.created_at).toLocaleString()}</span>
            </div>
            <span className="font-mono text-[11px]">ID: {diagnosis.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
