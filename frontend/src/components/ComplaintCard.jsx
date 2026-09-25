import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, MapPin, Send, CheckCircle2, Shield, Calendar, Building, User } from 'lucide-react';
import ResolutionTracker from './ResolutionTracker';

export default function ComplaintCard({ complaint, onVote, onAddComment, currentUserId, currentUserName }) {
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-raspberry text-white';
      case 'HIGH':
        return 'bg-pink-grapefruit text-white';
      case 'MEDIUM':
        return 'bg-lemon text-slate-900';
      default:
        return 'bg-lime text-slate-900';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return {
          text: 'Resolved',
          badge: 'bg-lime text-white'
        };
      case 'IN_PROGRESS':
        return {
          text: 'In Progress',
          badge: 'bg-lemon text-slate-900'
        };
      default:
        return {
          text: 'Open & Routed',
          badge: 'bg-raspberry text-white'
        };
    }
  };

  const statusInfo = getStatusBadge(complaint.status);
  const commentsList = complaint.comments || [];

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await onAddComment(complaint.id, newComment.trim());
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const imageSrc = complaint.image_url
    ? complaint.image_url
    : complaint.image_path
    ? (complaint.image_path.startsWith('http') || complaint.image_path.startsWith('/')
        ? complaint.image_path
        : `http://localhost:8000/${complaint.image_path}`)
    : complaint.issue_type?.toLowerCase().includes('pothole') || complaint.description?.toLowerCase().includes('pothole')
    ? '/images/pothole.jpg'
    : complaint.issue_type?.toLowerCase().includes('trash') || complaint.issue_type?.toLowerCase().includes('garbage') || complaint.description?.toLowerCase().includes('garbage')
    ? '/images/garbage.jpg'
    : null;

  const afterImageSrc = complaint.work_order?.after_image_path
    ? (complaint.work_order.after_image_path.startsWith('http') || complaint.work_order.after_image_path.startsWith('/')
        ? complaint.work_order.after_image_path
        : `http://localhost:8000/${complaint.work_order.after_image_path}`)
    : null;

  return (
    <article className="bg-white rounded-3xl shadow-sm hover:shadow-md transition duration-200 border-2 border-vanilla overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider bg-vanilla text-raspberry px-3 py-1 rounded-full flex items-center gap-1.5 border border-vanilla">
              <Building className="w-3.5 h-3.5 text-raspberry" />
              <span>{complaint.department || 'General Administration'}</span>
            </span>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${getSeverityStyle(complaint.severity)}`}>
              {complaint.severity || 'NORMAL'}
            </span>
          </div>

          <span className={`text-xs font-black px-3 py-1 rounded-full ${statusInfo.badge} flex items-center gap-1.5 shadow-2xs`}>
            {complaint.status === 'RESOLVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{statusInfo.text}</span>
          </span>
        </div>

        {/* Issue Title & Civic Location */}
        <h3 className="text-xl font-black text-slate-900 mb-1.5 leading-snug hover:text-raspberry transition">
          {complaint.issue_type || 'Civic Issue'}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3.5 flex-wrap">
          <span className="flex items-center gap-1.5 text-pink-grapefruit font-bold">
            <MapPin className="w-3.5 h-3.5 text-raspberry" />
            <span>{complaint.ward || 'Ward 14 (North Zone)'}, {complaint.city || 'Metro City'}</span>
          </span>
          <span className="text-vanilla font-black">|</span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{complaint.user_name || 'Citizen'}</span>
          </span>
          <span className="text-vanilla font-black">|</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed font-normal">
          {complaint.description || 'No additional details provided.'}
        </p>

        {/* Responsible Authority Banner */}
        <div className="bg-cream border border-vanilla rounded-xl p-2.5 text-xs flex items-center justify-between text-slate-800 mb-4">
          <div className="flex items-center gap-2 font-medium truncate">
            <Shield className="w-4 h-4 text-raspberry shrink-0" />
            <span className="text-slate-500 font-semibold">Assigned Authority:</span>
            <strong className="truncate text-slate-900">{complaint.local_authority || 'Local Ward Office'}</strong>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-vanilla text-raspberry px-2 py-0.5 rounded-md ml-2 shrink-0">
            Auto-Routed
          </span>
        </div>

        {/* Issue Photos: Before & After (if resolved) */}
        {imageSrc ? (
          <div className="relative mb-4">
            <img
              src={imageSrc}
              alt="Civic Issue Evidence"
              className="w-full h-48 object-cover rounded-2xl border-2 border-vanilla"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {complaint.status === 'RESOLVED' && afterImageSrc && (
              <div className="absolute bottom-2.5 right-2.5 bg-lime text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                Verified Repair Photo
              </div>
            )}
          </div>
        ) : null}

        {/* Priority Gauge */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Priority Index:</span>
          <span className="font-extrabold text-raspberry text-sm">{Math.round(complaint.priority_score || 50)} / 100</span>
        </div>
        <div className="w-full bg-vanilla/40 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              (complaint.priority_score || 50) > 80
                ? 'bg-raspberry'
                : (complaint.priority_score || 50) > 60
                ? 'bg-lemon'
                : 'bg-lime'
            }`}
            style={{ width: `${Math.min(100, complaint.priority_score || 50)}%` }}
          />
        </div>
      </div>

      {/* Social Engagement Layer: Upvote / Downvote & Progress Toggle */}
      <div className="px-6 py-3.5 bg-cream/70 border-t-2 border-vanilla">
        <div className="flex items-center justify-between">
          {/* Civic Social Support / Upvoting */}
          <div className="flex items-center bg-white border border-vanilla rounded-2xl p-1 shadow-2xs">
            <button
              onClick={() => onVote(complaint.id, 'UP')}
              title="Support this civic report"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                complaint.user_vote === 'UP'
                  ? 'bg-lime text-white'
                  : 'text-slate-700 hover:bg-vanilla/30 hover:text-lime'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${complaint.user_vote === 'UP' ? 'fill-white' : ''}`} />
              <span>{complaint.upvotes || 0}</span>
            </button>

            <span className="h-4 w-px bg-vanilla mx-1" />

            <button
              onClick={() => onVote(complaint.id, 'DOWN')}
              title="Downvote report"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                complaint.user_vote === 'DOWN'
                  ? 'bg-raspberry text-white'
                  : 'text-slate-700 hover:bg-vanilla/30 hover:text-raspberry'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${complaint.user_vote === 'DOWN' ? 'fill-white' : ''}`} />
              <span>{complaint.downvotes || 0}</span>
            </button>
          </div>

          {/* Toggle Progress & Discussion */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-raspberry hover:text-pink-grapefruit transition px-3.5 py-2 rounded-xl bg-white border border-vanilla hover:bg-vanilla/20 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-grapefruit" />
            <span>Track & Discuss ({commentsList.length})</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Section: Resolution Tracker & Comments */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-vanilla">
            {/* Resolution Stepper Tracker */}
            <ResolutionTracker complaint={complaint} />

            {/* Resolved After-Image Evidence if Available */}
            {complaint.status === 'RESOLVED' && afterImageSrc && (
              <div className="my-3 p-3.5 bg-white rounded-2xl border-2 border-vanilla">
                <span className="text-xs font-bold text-lime block mb-2">Verified Repair Evidence:</span>
                <img
                  src={afterImageSrc}
                  alt="Repair completion"
                  className="w-full h-44 object-cover rounded-xl border border-vanilla"
                />
              </div>
            )}

            {/* Community Comments Section */}
            <div className="mt-4">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-raspberry mb-2.5">
                Citizen Discussion & Updates ({commentsList.length})
              </h5>

              <div className="space-y-2 mb-3.5 max-h-48 overflow-y-auto pr-1">
                {commentsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-1 font-medium">No citizen comments yet. Share an update below.</p>
                ) : (
                  commentsList.map((comm) => (
                    <div key={comm.id} className="bg-white p-3 rounded-xl border border-vanilla text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">{comm.user_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 font-normal">{comm.comment_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add civic comment or status update..."
                  className="flex-1 text-xs border border-vanilla rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-raspberry bg-white font-medium text-slate-800"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-raspberry hover:bg-pink-grapefruit disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}