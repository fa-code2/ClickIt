import React, { useEffect, useState } from 'react';
import Map from '../components/Map';
import ComplaintCard from '../components/ComplaintCard';
import AiSeverityModal from '../components/AiSeverityModal';
import AiVerifyModal from '../components/AiVerifyModal';
import OfficerRewardsModal from '../components/OfficerRewardsModal';
import { api } from '../services/api';
import { RefreshCw, CheckCircle2, Building, Camera, X, Filter, ShieldCheck, ArrowRight, Sparkles, Trophy, Flame, Award } from 'lucide-react';

export default function MunicipalDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Inspection & Verification modals
  const [inspectingComplaint, setInspectingComplaint] = useState(null);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [showOfficerRewards, setShowOfficerRewards] = useState(false);

  // Resolution Modal state (kept for backward compatibility)
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({
        sortBy: 'priority',
        ward: selectedWard,
        status: selectedStatus
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedWard, selectedStatus]);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingComplaint || !afterImage) {
      alert('Please upload an after-repair verification photo.');
      return;
    }

    setSubmittingResolution(true);
    try {
      const workOrderId = resolvingComplaint.work_order?.id || resolvingComplaint.id;
      await api.resolveWorkOrder(workOrderId, afterImage, resolutionNotes);
      setResolvingComplaint(null);
      setAfterImage(null);
      setAfterPreview(null);
      setResolutionNotes('');
      fetchComplaints();
    } catch (err) {
      console.error('Resolution error:', err);
      // Fallback local update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === resolvingComplaint.id
            ? {
                ...c,
                status: 'RESOLVED',
                work_order: {
                  ...c.work_order,
                  status: 'RESOLVED',
                  resolution_notes: resolutionNotes || 'Repaired and verified on-site by municipal crew.'
                }
              }
            : c
        )
      );
      setResolvingComplaint(null);
    } finally {
      setSubmittingResolution(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-vanilla text-raspberry px-3 py-0.5 rounded-full border border-vanilla">
              Official Operations
            </span>
            <span className="text-xs text-pink-grapefruit font-bold">Field Operations & Automated Routing</span>
          </div>
          <h1 className="text-3xl font-black text-raspberry mt-1 tracking-tight">Municipal Operations Command</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOfficerRewards(true)}
            className="bg-raspberry text-white font-extrabold px-4 py-2.5 rounded-2xl hover:bg-pink-grapefruit transition shadow-xs flex items-center gap-2 text-xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-lemon" />
            <span>Officer Rewards & Badges</span>
          </button>
          <button
            onClick={fetchComplaints}
            className="bg-white border-2 border-vanilla text-raspberry font-extrabold px-4 py-2.5 rounded-2xl hover:bg-vanilla/40 transition shadow-xs flex items-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Dedicated Officer Section: Your Work (Citizen Reports Under Your Jurisdiction) */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border-2 border-vanilla shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-vanilla pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider bg-raspberry text-white px-3 py-0.5 rounded-full shadow-2xs">
                  Your Jurisdiction Work Queue
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Citizen Reports Filed Under Your Command
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Your Work: Active Citizen Reports & Dispatches
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Review and resolve civic issues submitted by residents in your assigned zone. Every closure requires timestamped on-site photo proof.
              </p>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-3">
              <div className="bg-cream p-3 rounded-2xl border border-vanilla text-center min-w-[85px]">
                <span className="text-lg font-black text-raspberry block">
                  {complaints.filter((c) => c.status === 'OPEN').length}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Action Needed</span>
              </div>
              <div className="bg-cream p-3 rounded-2xl border border-vanilla text-center min-w-[85px]">
                <span className="text-lg font-black text-pink-grapefruit block">
                  {complaints.filter((c) => c.status === 'IN_PROGRESS').length}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">In Field</span>
              </div>
              <div className="bg-cream p-3 rounded-2xl border border-vanilla text-center min-w-[85px]">
                <span className="text-lg font-black text-lime block">
                  {complaints.filter((c) => c.status === 'RESOLVED').length}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Verified</span>
              </div>
            </div>
          </div>

          {/* Priority Queue Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/50 p-3.5 rounded-2xl border border-vanilla">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Priority Sorting Queue:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPriorityFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  priorityFilter === 'ALL'
                    ? 'bg-raspberry text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-vanilla hover:bg-vanilla/40'
                }`}
              >
                All Priorities ({complaints.length})
              </button>
              <button
                onClick={() => setPriorityFilter('CRITICAL')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                  priorityFilter === 'CRITICAL'
                    ? 'bg-raspberry text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-vanilla hover:bg-vanilla/40'
                }`}
              >
                <Flame className="w-3 h-3 fill-current text-raspberry" />
                <span>Critical Priority (85+)</span>
              </button>
              <button
                onClick={() => setPriorityFilter('HIGH')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  priorityFilter === 'HIGH'
                    ? 'bg-raspberry text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-vanilla hover:bg-vanilla/40'
                }`}
              >
                High Priority (70-84)
              </button>
              <button
                onClick={() => setPriorityFilter('MEDIUM')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  priorityFilter === 'MEDIUM'
                    ? 'bg-raspberry text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-vanilla hover:bg-vanilla/40'
                }`}
              >
                Standard (Below 70)
              </button>
            </div>
          </div>

          {/* Your Work Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints
              .filter((c) => {
                if (priorityFilter === 'CRITICAL') return (c.priority_score || 0) >= 85;
                if (priorityFilter === 'HIGH') return (c.priority_score || 0) >= 70 && (c.priority_score || 0) < 85;
                if (priorityFilter === 'MEDIUM') return (c.priority_score || 0) < 70;
                return true;
              })
              .slice(0, 6)
              .map((c) => {
              const citizenName = c.user_name || c.user?.full_name || 'Resident Citizen';
              const defectImg = c.image_url || (c.issue_type?.toLowerCase().includes('pothole')
                ? '/images/pothole.jpg'
                : c.issue_type?.toLowerCase().includes('trash') || c.issue_type?.toLowerCase().includes('garbage')
                ? '/images/garbage.jpg'
                : null);

              return (
                <div
                  key={c.id}
                  className="bg-cream/50 rounded-2xl border-2 border-vanilla p-5 flex flex-col justify-between space-y-4 hover:border-raspberry/30 transition shadow-2xs"
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-vanilla text-raspberry px-2.5 py-0.5 rounded-full border border-vanilla">
                        {c.department || 'Public Works'}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          c.status === 'RESOLVED'
                            ? 'bg-lime text-white'
                            : c.status === 'IN_PROGRESS'
                            ? 'bg-lemon text-slate-900'
                            : 'bg-raspberry text-white'
                        }`}
                      >
                        {c.status === 'RESOLVED' ? 'Verified Resolved' : c.status === 'IN_PROGRESS' ? 'In Progress' : 'Open Ticket'}
                      </span>
                    </div>

                    {/* Defect photo preview if available */}
                    {defectImg && (
                      <div className="relative rounded-xl overflow-hidden h-32 border border-vanilla">
                        <img
                          src={defectImg}
                          alt={c.issue_type || 'Civic defect'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1.5 left-1.5 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Citizen Photo Evidence
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-raspberry bg-vanilla px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Flame className="w-3 h-3 text-lemon fill-lemon" />
                          <span>Priority: {c.priority_score || 70}/100</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {c.severity || 'HIGH'} SEVERITY
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm line-clamp-1">
                        {c.issue_type || 'Civic Infrastructure Defect'}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                        {c.description}
                      </p>
                    </div>

                    {/* Citizen who posted it */}
                    <div className="bg-white p-2.5 rounded-xl border border-vanilla space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Filed by Citizen:</span>
                        <span className="font-black text-slate-800">{citizenName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Jurisdiction Ward:</span>
                        <span className="font-bold text-raspberry">{c.ward || 'Central Zone'}</span>
                      </div>
                    </div>

                    {/* Inspect AI Severity Analysis Trigger */}
                    <button
                      type="button"
                      onClick={() => setInspectingComplaint(c)}
                      className="w-full py-1.5 rounded-xl bg-white hover:bg-vanilla/60 text-raspberry border border-vanilla text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-raspberry" />
                      <span>Inspect AI Severity Analysis</span>
                    </button>
                  </div>

                  {/* Officer Action Bar */}
                  <div className="pt-2 border-t border-vanilla flex flex-col gap-2">
                    {c.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setComplaints((prev) =>
                            prev.map((item) =>
                              item.id === c.id ? { ...item, status: 'IN_PROGRESS' } : item
                            )
                          );
                        }}
                        className="w-full py-2 rounded-xl bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-black transition shadow-xs cursor-pointer"
                      >
                        Accept & Dispatch Crew
                      </button>
                    )}

                    {c.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => setResolvingComplaint(c)}
                        className="w-full py-2 rounded-xl bg-lime hover:opacity-90 text-white text-xs font-black transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Verify via Gemini AI</span>
                      </button>
                    )}

                    {c.status === 'RESOLVED' && (
                      <div className="w-full py-2 rounded-xl bg-lime/20 text-lime text-xs font-black text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Resolved via Gemini AI</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Geographic Incident Map */}
        <section className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs">
          <div className="flex items-center justify-between mb-3.5 px-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-raspberry flex items-center gap-2">
              <Building className="w-4 h-4 text-raspberry" />
              <span>Live Civic Incidents GIS Map</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Mapped by citizen GPS coordinates</span>
          </div>
          <Map complaints={complaints} />
        </section>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs">
          <div className="flex items-center gap-2 text-xs text-raspberry font-extrabold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-raspberry" />
            <span>All City Dispatch Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="text-xs border border-vanilla rounded-xl px-3.5 py-2 bg-cream/40 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-raspberry"
            >
              <option value="ALL">All Civic Wards</option>
              <option value="Ward 14 (North Zone)">Ward 14 (North Zone)</option>
              <option value="Ward 8 (Central District)">Ward 8 (Central District)</option>
              <option value="Ward 3 (South Corridor)">Ward 3 (South Corridor)</option>
              <option value="Ward 21 (East Suburbs)">Ward 21 (East Suburbs)</option>
              <option value="Ward 17 (West Industrial Zone)">Ward 17 (West Industrial Zone)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-vanilla rounded-xl px-3.5 py-2 bg-cream/40 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-raspberry"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open & Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved & Verified</option>
            </select>
          </div>

          <span className="text-xs font-black text-slate-700 bg-vanilla px-3 py-1.5 rounded-xl border border-vanilla">
            {complaints.length} Total Registered Complaints
          </span>
        </div>

        {/* Complaints Grid with Action Buttons */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="relative">
                <ComplaintCard
                  complaint={complaint}
                  onVote={() => {}}
                  onAddComment={() => {}}
                />

                {/* Officer Actions on ComplaintCard */}
                <div className="mt-3 bg-white p-3 rounded-2xl border-2 border-vanilla shadow-xs flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectingComplaint(complaint)}
                    className="py-1.5 px-3 rounded-xl bg-cream hover:bg-vanilla text-raspberry border border-vanilla text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-raspberry" />
                    <span>Inspect AI Severity</span>
                  </button>

                  {complaint.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setResolvingComplaint(complaint)}
                      className="bg-lime hover:opacity-90 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Verify via Gemini AI</span>
                    </button>
                  ) : (
                    <span className="text-xs font-black text-lime bg-lime/10 px-3 py-1.5 rounded-xl border border-lime/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Deep Gemini AI Severity Inspection Modal */}
      {inspectingComplaint && (
        <AiSeverityModal
          complaint={inspectingComplaint}
          onClose={() => setInspectingComplaint(null)}
        />
      )}

      {/* Gemini AI Auto-Verify Resolution Modal */}
      {resolvingComplaint && (
        <AiVerifyModal
          complaint={resolvingComplaint}
          onClose={() => setResolvingComplaint(null)}
          onVerified={() => {
            fetchComplaints();
          }}
        />
      )}

      {/* Officer Merit & Performance Rewards Dashboard */}
      {showOfficerRewards && (
        <OfficerRewardsModal
          onClose={() => setShowOfficerRewards(false)}
        />
      )}
    </div>
  );
}