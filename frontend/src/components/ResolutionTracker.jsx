import React from 'react';
import { CheckCircle2, Clock, Building2, UserCheck, ShieldCheck, Info } from 'lucide-react';

export default function ResolutionTracker({ complaint }) {
  if (!complaint) return null;

  const status = (complaint.status || 'OPEN').toUpperCase();
  const routingStatus = (complaint.routing_status || 'ROUTED').toUpperCase();

  // Determine active step (1 to 4)
  let currentStep = 1;
  if (status === 'RESOLVED') {
    currentStep = 4;
  } else if (status === 'IN_PROGRESS' || routingStatus.includes('FIELD') || routingStatus.includes('PROGRESS')) {
    currentStep = 3;
  } else if (routingStatus.includes('ROUTED') || routingStatus.includes('DISPATCHED') || complaint.department) {
    currentStep = 2;
  }

  const steps = [
    {
      step: 1,
      title: 'Reported',
      desc: 'AI Classified',
      detail: `Reported by ${complaint.user_name || 'Citizen'} on ${new Date(complaint.created_at).toLocaleDateString()}`
    },
    {
      step: 2,
      title: 'Routed & Assigned',
      desc: complaint.department || 'Municipal Dept',
      detail: complaint.local_authority || 'Assigned to Ward Representative'
    },
    {
      step: 3,
      title: 'Work Order Active',
      desc: 'Field Operations',
      detail: complaint.work_order ? `Order #${complaint.work_order.id.slice(0, 8)} in progress` : 'Active dispatch'
    },
    {
      step: 4,
      title: 'Resolved & Verified',
      desc: 'Quality Inspected',
      detail: complaint.work_order?.resolution_notes || (status === 'RESOLVED' ? 'Civic repair completed.' : 'Pending repair completion')
    }
  ];

  return (
    <div className="bg-cream/70 border border-vanilla rounded-2xl p-4 my-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-raspberry flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-raspberry" />
          <span>Civic Resolution Tracker</span>
        </h4>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            status === 'RESOLVED'
              ? 'bg-lime text-white'
              : status === 'IN_PROGRESS'
              ? 'bg-lemon text-slate-900'
              : 'bg-raspberry text-white'
          }`}
        >
          {status === 'RESOLVED' ? 'Resolved & Verified' : status === 'IN_PROGRESS' ? 'Action In Progress' : 'Report Logged & Routed'}
        </span>
      </div>

      {/* Stepper bar */}
      <div className="relative flex items-center justify-between px-2">
        <div className="absolute left-6 right-6 top-3.5 h-1 bg-vanilla -z-0" />
        <div
          className="absolute left-6 top-3.5 h-1 bg-raspberry transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((s) => {
          const isDone = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs transition shadow-xs ${
                  isDone
                    ? 'bg-lime text-white'
                    : isCurrent
                    ? 'bg-raspberry text-white ring-4 ring-pink-grapefruit/30 animate-pulse'
                    : 'bg-white border-2 border-vanilla text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 text-center ${isCurrent ? 'text-raspberry' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Routing Context Cards */}
      <div className="mt-4 pt-3 border-t border-vanilla grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="flex items-start gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-vanilla">
          <Building2 className="w-4 h-4 text-raspberry shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-900">Target Department</span>
            <span className="text-slate-600 text-xs">{complaint.department || 'General Administration'}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-vanilla">
          <UserCheck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-900">Local Authority & Ward</span>
            <span className="text-slate-600 text-xs">{complaint.local_authority || `${complaint.ward || 'Local Ward'} Councilor Office`}</span>
          </div>
        </div>
      </div>

      {/* Resolution Notes if Resolved */}
      {status === 'RESOLVED' && complaint.work_order?.resolution_notes && (
        <div className="mt-3 p-3 bg-white border border-lime/60 rounded-xl text-xs text-slate-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-lime shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-lime">Official Resolution Verification</span>
            {complaint.work_order.resolution_notes}
          </div>
        </div>
      )}

      {/* Routing notes */}
      {complaint.routing_notes && status !== 'RESOLVED' && (
        <div className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-vanilla flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-raspberry shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed font-medium">{complaint.routing_notes}</p>
        </div>
      )}
    </div>
  );
}
