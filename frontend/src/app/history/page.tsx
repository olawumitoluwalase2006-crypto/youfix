"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { HistoryCard } from "@/components/HistoryCard";
import { getDiagnosisHistory, getDiagnosisStats } from "@/lib/api";
import { DiagnosisRecord, DiagnosisStats, ProblemCategory, RiskLevel } from "@/lib/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [stats, setStats] = useState<DiagnosisStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [diyFilter, setDiyFilter] = useState<"All" | "DIY" | "Pro">("All");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [historyData, statsData] = await Promise.allSettled([
        getDiagnosisHistory(
          selectedCategory !== "All" ? selectedCategory : undefined,
          selectedRisk !== "All" ? selectedRisk : undefined
        ),
        getDiagnosisStats(),
      ]);

      if (historyData.status === "fulfilled") {
        setRecords(historyData.value);
      }
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedRisk]);

  // Client-side filtering for search query & DIY/Pro toggle
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recommended_action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiy =
      diyFilter === "All"
        ? true
        : diyFilter === "DIY"
        ? r.is_diy
        : r.professional_required;

    return matchesSearch && matchesDiy;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <History className="w-4 h-4" />
            <span>Supabase Audit Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Diagnosis History & Archives
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit past visual assessments, fault patterns, and safety hazard alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Diagnosis</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Scans
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats?.total_diagnoses ?? records.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded in Supabase</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            DIY Eligible
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats?.diy_eligible ?? records.filter((r) => r.is_diy).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Safely fixable at home</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Pro Required
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {stats?.professional_required ?? records.filter((r) => r.professional_required).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Licensed contractor call</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            High Risk Alerts
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {stats?.high_risk_alerts ?? records.filter((r) => r.risk_level === "High").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Critical hazards flagged</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by cause, recommendation, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Categories</option>
              <option value="Leaking pipe">Leaking pipe</option>
              <option value="Clogged drain">Clogged drain</option>
              <option value="Damaged electrical socket">Damaged electrical socket</option>
              <option value="Flat tire">Flat tire</option>
              <option value="Overheating engine">Overheating engine</option>
              <option value="Invalid Image">Invalid Image</option>
            </select>

            {/* Risk Level Dropdown */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        {/* DIY vs Pro Pill Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-2">Type:</span>
          {(["All", "DIY", "Pro"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDiyFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                diyFilter === mode
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mode === "All" ? "All Types" : mode === "DIY" ? "DIY Solvable" : "Pro Required"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse space-y-4">
              <div className="w-full h-40 bg-slate-200 rounded-xl" />
              <div className="w-3/4 h-4 bg-slate-200 rounded" />
              <div className="w-1/2 h-3 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <HistoryCard key={record.id} diagnosis={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No diagnosis records found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filter settings, or run a new scan.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Diagnosis</span>
          </Link>
        </div>
      )}
    </div>
  );
}
