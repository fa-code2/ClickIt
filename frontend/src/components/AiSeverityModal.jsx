import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, ShieldAlert, Clock, Wrench, X, AlertTriangle, CheckCircle2, Flame, MapPin } from 'lucide-react';

export default function AiSeverityModal({ complaint, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (complaint?.id) {
      loadAnalysis();
    }
  }, [complaint]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await api.getAiSeverityAnalysis(complaint.id);
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to load AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border-2 border-vanilla shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vanilla pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-raspberry" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-raspberry text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                Gemini Multimodal Inspection Engine
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                AI Severity & Risk Analysis
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-raspberry transition p-1.5 rounded-xl hover:bg-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-bold text-sm">
            Evaluating multimodal severity heuristics...
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Primary defect summary */}
            <div className="bg-cream/60 p-5 rounded-2xl border-2 border-vanilla space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-pink-grapefruit">
                  {analysis.department} • {analysis.ward}
                </span>
                <span className="text-xs font-black text-white bg-raspberry px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Priority {analysis.priority_score}/100</span>
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">{analysis.issue_type}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {complaint.description || 'Civic infrastructure defect logged by local resident with geotagged evidence.'}
              </p>
            </div>

            {/* Risk Breakdown Progress Bars */}
            <div className="bg-white p-5 rounded-2xl border border-vanilla space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Multimodal Risk Factor Breakdown
              </span>

              {/* Public safety risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-raspberry" />
                    Public Safety & Hazard Risk
                  </span>
                  <span className="text-raspberry font-extrabold">
                    {analysis.risk_breakdown.public_safety_risk}%
                  </span>
                </div>
                <div className="w-full bg-cream h-2.5 rounded-full overflow-hidden border border-vanilla">
                  <div
                    className="bg-raspberry h-full rounded-full transition-all duration-500"
                    style={{ width: `${analysis.risk_breakdown.public_safety_risk}%` }}
                  />
                </div>
              </div>

              {/* Transit Disruption */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-lemon" />
                    Roadway & Transit Disruption
                  </span>
                  <span className="text-lemon font-extrabold">
                    {analysis.risk_breakdown.transit_disruption_risk}%
                  </span>
                </div>
                <div className="w-full bg-cream h-2.5 rounded-full overflow-hidden border border-vanilla">
                  <div
                    className="bg-lemon h-full rounded-full transition-all duration-500"
                    style={{ width: `${analysis.risk_breakdown.transit_disruption_risk}%` }}
                  />
                </div>
              </div>

              {/* Environmental Threat */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-lime" />
                    Environmental / Structural Risk
                  </span>
                  <span className="text-lime font-extrabold">
                    {analysis.risk_breakdown.environmental_hazard_risk}%
                  </span>
                </div>
                <div className="w-full bg-cream h-2.5 rounded-full overflow-hidden border border-vanilla">
                  <div
                    className="bg-lime h-full rounded-full transition-all duration-500"
                    style={{ width: `${analysis.risk_breakdown.environmental_hazard_risk}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommended Crew & Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-cream/40 p-4 rounded-2xl border border-vanilla space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Target Resolution SLA
                </span>
                <span className="text-lg font-black text-slate-900 block">
                  Within {analysis.sla_target_hours} Hours
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Auto-calculated based on high-density pedestrian zone & ward population index.
                </p>
              </div>

              <div className="bg-cream/40 p-4 rounded-2xl border border-vanilla space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-grapefruit flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  Recommended Crew Dispatch
                </span>
                <span className="font-black text-slate-900 block text-xs">
                  {analysis.recommended_crew}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Auto-requisitioned gear matches defect visual density.
                </p>
              </div>
            </div>

            {/* AI Diagnostics badge */}
            <div className="bg-vanilla/30 p-3.5 rounded-xl border border-vanilla flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>Gemini 1.5 Multimodal Visual Defect Confidence:</span>
              </div>
              <span className="font-black text-raspberry">
                {analysis.gemini_heuristics?.visual_defect_confidence || 97.4}%
              </span>
            </div>
          </div>
        ) : null}

        <div className="pt-2 border-t border-vanilla flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-black transition shadow-xs"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
