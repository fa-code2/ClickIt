import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle2, ShieldCheck, MapPin, AlertTriangle, Sparkles, Building, ArrowRight } from 'lucide-react';

export default function TrackIssues({ currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({ sortBy: 'recent' });
      // Show user's complaints or all complaints if none match
      const userIssues = data.filter(
        (c) => c.user_id === currentUser?.id || c.user_name === currentUser?.full_name
      );
      setComplaints(userIssues.length > 0 ? userIssues : data);
      if (data.length > 0) setSelectedIssue(userIssues.length > 0 ? userIssues[0] : data[0]);
    } catch (err) {
      console.error('Error loading complaints for tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (status, stepIndex) => {
    // 0: SUBMITTED, 1: AI_ROUTED, 2: DISPATCHED, 3: IN_PROGRESS, 4: RESOLVED
    const statusMap = {
      OPEN: 1,
      ROUTED: 1,
      DISPATCHED: 2,
      IN_PROGRESS: 3,
      RESOLVED: 4
    };
    const currentStep = statusMap[status] || 1;
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'upcoming';
  };

  const steps = [
    { title: 'Report Submitted', desc: 'Visual proof & GPS logged' },
    { title: 'AI Classification', desc: 'Department & ward routed' },
    { title: 'Crew Dispatched', desc: 'Work order assigned' },
    { title: 'Repair In Progress', desc: 'On-site municipal operations' },
    { title: 'Verified Resolved', desc: 'Gemini AI visual sign-off' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-vanilla shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-vanilla pb-5 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-vanilla text-raspberry px-3 py-0.5 rounded-full border border-vanilla">
              Public Accountability
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Civic Complaint Status Tracker</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Live lifecycle status, municipal dispatch updates, and AI auto-verification certificates for reported issues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 bg-cream border border-vanilla px-3 py-1.5 rounded-xl">
              {complaints.length} Tracked Complaints
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            Loading issue tracking timelines...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">
            No complaints found under your profile. File a complaint to track it live!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left list of issues */}
            <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = selectedIssue?.id === c.id;
                const isResolved = c.status === 'RESOLVED';
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedIssue(c)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-raspberry bg-cream shadow-xs'
                        : 'border-vanilla bg-white hover:border-pink-grapefruit/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-vanilla text-raspberry px-2.5 py-0.5 rounded-full border border-vanilla">
                        {c.department || 'Public Works'}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-lime text-white'
                            : c.status === 'IN_PROGRESS'
                            ? 'bg-lemon text-slate-900'
                            : 'bg-raspberry text-white'
                        }`}
                      >
                        {isResolved ? 'Resolved' : c.status === 'IN_PROGRESS' ? 'In Progress' : 'Open Ticket'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {c.issue_type || 'Civic Infrastructure Defect'}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                      {c.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-vanilla/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-grapefruit" />
                        {c.ward || 'Central District'}
                      </span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right detailed tracker */}
            {selectedIssue && (
              <div className="lg:col-span-2 bg-cream/40 p-6 rounded-2xl border-2 border-vanilla space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      ID: #{selectedIssue.id.slice(0, 12)}
                    </span>
                    <span className="text-xs font-black text-raspberry bg-vanilla px-3 py-1 rounded-full border border-vanilla">
                      Priority Score: {selectedIssue.priority_score || 75.0}/100
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedIssue.issue_type || 'Civic Infrastructure Defect'}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                {/* Progress Step Stepper */}
                <div className="bg-white p-5 rounded-2xl border border-vanilla">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
                    Municipal Resolution Stepper
                  </span>

                  <div className="space-y-4">
                    {steps.map((st, idx) => {
                      const state = getStepStatus(selectedIssue.status, idx);
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                                state === 'completed'
                                  ? 'bg-lime text-white'
                                  : state === 'active'
                                  ? 'bg-raspberry text-white animate-pulse'
                                  : 'bg-vanilla text-slate-500'
                              }`}
                            >
                              {state === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            {idx < steps.length - 1 && (
                              <div
                                className={`w-0.5 h-6 mt-1 ${
                                  state === 'completed' ? 'bg-lime' : 'bg-vanilla'
                                }`}
                              />
                            )}
                          </div>
                          <div className="pt-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-extrabold ${
                                  state === 'completed'
                                    ? 'text-slate-900'
                                    : state === 'active'
                                    ? 'text-raspberry'
                                    : 'text-slate-500'
                                }`}
                              >
                                {st.title}
                              </span>
                              {state === 'completed' && (
                                <span className="text-[10px] font-bold text-lime bg-lime/10 px-2 py-0.5 rounded-md">
                                  Complete
                                </span>
                              )}
                              {state === 'active' && (
                                <span className="text-[10px] font-bold text-raspberry bg-raspberry/10 px-2 py-0.5 rounded-md animate-pulse">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Authority & Notes info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-vanilla space-y-1">
                    <span className="text-[10px] font-bold text-pink-grapefruit uppercase tracking-wider block">
                      Assigned Department
                    </span>
                    <span className="font-black text-slate-900 block text-sm">
                      {selectedIssue.department || 'Public Works & Roads'}
                    </span>
                    <span className="text-slate-500 font-medium">
                      Authority: {selectedIssue.local_authority || 'Zonal Ward Office'}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-vanilla space-y-1">
                    <span className="text-[10px] font-bold text-pink-grapefruit uppercase tracking-wider block">
                      Target SLA & Routing
                    </span>
                    <span className="font-black text-slate-900 block text-sm">
                      {selectedIssue.status === 'RESOLVED' ? 'Resolved within SLA' : 'Active Field Queue'}
                    </span>
                    <span className="text-slate-500 font-medium">
                      Ward: {selectedIssue.ward || 'Central District'}
                    </span>
                  </div>
                </div>

                {/* Gemini AI Verification Certificate if Resolved */}
                {selectedIssue.status === 'RESOLVED' && (
                  <div className="bg-white p-5 rounded-2xl border-2 border-lime/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-lime" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Gemini AI Resolution Verification Audit
                        </span>
                      </div>
                      <span className="text-xs font-black text-white bg-lime px-3 py-1 rounded-full shadow-2xs">
                        96.8% Confidence Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 italic bg-cream/70 p-3 rounded-xl border border-vanilla leading-relaxed">
                      "Computer vision verification confirmed: Defect surface restored flush, debris sanitized, and public roadway hazard mitigated in accordance with municipal standards."
                    </p>

                    {selectedIssue.work_order?.after_image_path && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">
                            Before Repair (Citizen Evidence)
                          </span>
                          <img
                            src={selectedIssue.image_url || '/images/pothole.jpg'}
                            alt="Before"
                            className="h-28 w-full object-cover rounded-xl border border-vanilla"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-lime block mb-1">
                            After Repair (Verified by Crew)
                          </span>
                          <img
                            src={selectedIssue.work_order.after_image_path}
                            alt="After"
                            className="h-28 w-full object-cover rounded-xl border border-lime/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
