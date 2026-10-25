"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Wrench,
  X,
  Droplets,
  Zap,
  Disc,
  Flame,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
import { DiagnosisRecord, ProblemCategory, RiskLevel } from "@/lib/types";

interface HistoryCardProps {
  diagnosis: DiagnosisRecord;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ diagnosis }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Category Icon
  const getCategoryIcon = (cat: ProblemCategory) => {
    switch (cat) {
      case "Leaking pipe":
      case "Clogged drain":
        return Droplets;
      case "Damaged electrical socket":
        return Zap;
      case "Flat tire":
        return Disc;
      case "Overheating engine":
        return Flame;
      case "Invalid Image":
        return AlertTriangle;
      default:
        return Wrench;
    }
  };

  const Icon = getCategoryIcon(diagnosis.category);

  // Risk styling
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
        {/* Thumbnail with Overlay Badges */}
        <div className="relative w-full h-44 bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diagnosis.image_url}
            alt={diagnosis.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm ${getRiskColor(diagnosis.risk_level)}`}>
              {diagnosis.risk_level} Risk
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5">
            {diagnosis.category === "Invalid Image" ? (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                Invalid Photo
              </span>
            ) : diagnosis.professional_required ? (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                Pro Required
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                DIY Solved
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Icon className="w-3.5 h-3.5" />
              <span>{diagnosis.category}</span>
            </div>

            <p className="text-xs text-slate-700 line-clamp-2 mt-1.5 font-medium">
              {diagnosis.cause}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(diagnosis.created_at).toLocaleDateString()}</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Protocol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Diagnosis Record
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {diagnosis.category}
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning, Invalid Image, or DIY Callout */}
            {diagnosis.category === "Invalid Image" ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Non-Repair / Invalid Image</span>
                </div>
                <p className="text-xs text-amber-700">
                  {diagnosis.safety_warning || "The uploaded image does not appear to show a household or automotive fault."}
                </p>
              </div>
            ) : diagnosis.professional_required ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Licensed Professional Required</span>
                </div>
                <p className="text-xs text-rose-700">
                  {diagnosis.safety_warning || "Severe hazard detected. Do not attempt DIY repair."}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Safe for home DIY resolution.</span>
              </div>
            )}

            {/* Cause & Recommended Action */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Root Cause
                </span>
                <p className="text-sm text-slate-800 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {diagnosis.cause}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Action
                </span>
                <p className="text-sm font-semibold text-blue-900 mt-1 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                  {diagnosis.recommended_action}
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                Repair & Containment Instructions:
              </h4>
              <div className="space-y-2">
                {diagnosis.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed mt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
