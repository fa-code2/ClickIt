import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import ComplaintCard from './ComplaintCard';
import { Search, Flame, Clock, AlertTriangle, Filter, CheckCircle2, RefreshCw, ThumbsUp, Building, MapPin, Layers } from 'lucide-react';

export default function CommunityFeed({ currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes' | 'priority' | 'recent'
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchFeed = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const data = await api.getComplaints({
        sortBy,
        department: selectedDepartment,
        ward: selectedWard,
        status: selectedStatus,
        userId: currentUser?.id || 'citizen-guest'
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error loading community feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [sortBy, selectedWard, selectedDepartment, selectedStatus]);

  // Handle Voting
  const handleVote = async (complaintId, voteType) => {
    const userId = currentUser?.id || 'citizen-guest';
    const result = await api.vote(complaintId, voteType, userId);
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              upvotes: result.upvotes,
              downvotes: result.downvotes,
              user_vote: result.user_vote
            }
          : c
      )
    );
  };

  // Handle Commenting
  const handleAddComment = async (complaintId, commentText) => {
    const userName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Citizen';
    const userId = currentUser?.id || 'citizen-guest';
    const newComment = await api.addComment(complaintId, commentText, userName, userId);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            comments: [...(c.comments || []), newComment]
          };
        }
        return c;
      })
    );
  };

  // Client-side text search
  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) return complaints;
    const q = searchQuery.toLowerCase();
    return complaints.filter(
      (c) =>
        c.issue_type?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.ward?.toLowerCase().includes(q) ||
        c.local_authority?.toLowerCase().includes(q)
    );
  }, [complaints, searchQuery]);

  // Community statistics calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
    const totalUpvotes = complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0);
    return { total, resolved, inProgress, totalUpvotes };
  }, [complaints]);

  const wardsList = [
    'ALL',
    'Ward 14 (North Zone)',
    'Ward 8 (Central District)',
    'Ward 3 (South Corridor)',
    'Ward 21 (East Suburbs)',
    'Ward 17 (West Industrial Zone)'
  ];

  const departmentList = [
    'ALL',
    'Public Works',
    'Sanitation',
    'Water Supply',
    'Electrical Infrastructure',
    'Parks'
  ];

  return (
    <div className="space-y-6">
      {/* Civic Community Metric Banners */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-vanilla text-raspberry flex items-center justify-center font-bold shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">{stats.total}</span>
            <span className="text-xs text-pink-grapefruit font-bold uppercase tracking-wider">Reported Issues</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-lime/20 text-lime flex items-center justify-center font-bold shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">{stats.totalUpvotes}</span>
            <span className="text-xs text-lime font-bold uppercase tracking-wider">Citizen Upvotes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-lemon/20 text-lemon flex items-center justify-center font-bold shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">{stats.inProgress}</span>
            <span className="text-xs text-lemon font-bold uppercase tracking-wider">In Resolution</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-lime text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">{stats.resolved}</span>
            <span className="text-xs text-lime font-bold uppercase tracking-wider">Verified Solved</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Sorting */}
      <div className="bg-white p-5 rounded-3xl border-2 border-vanilla shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-pink-grapefruit absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, streets, departments..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
            />
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1.5 bg-cream p-1.5 rounded-2xl border border-vanilla w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSortBy('upvotes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                sortBy === 'upvotes'
                  ? 'bg-raspberry text-white shadow-xs'
                  : 'text-slate-600 hover:text-raspberry'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Most Supported</span>
            </button>

            <button
              onClick={() => setSortBy('priority')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                sortBy === 'priority'
                  ? 'bg-raspberry text-white shadow-xs'
                  : 'text-slate-600 hover:text-raspberry'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Urgent Priority</span>
            </button>

            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                sortBy === 'recent'
                  ? 'bg-raspberry text-white shadow-xs'
                  : 'text-slate-600 hover:text-raspberry'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Most Recent</span>
            </button>
          </div>
        </div>

        {/* Civic Area Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-vanilla/60">
          <div className="flex items-center gap-1.5 text-xs text-raspberry font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-raspberry" />
            <span>Filter By:</span>
          </div>

          {/* Ward filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs border border-vanilla rounded-xl px-3 py-2 bg-cream/50 focus:outline-none focus:ring-1 focus:ring-raspberry text-slate-800 font-bold"
          >
            {wardsList.map((w) => (
              <option key={w} value={w}>
                {w === 'ALL' ? 'All Civic Wards' : w}
              </option>
            ))}
          </select>

          {/* Department filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs border border-vanilla rounded-xl px-3 py-2 bg-cream/50 focus:outline-none focus:ring-1 focus:ring-raspberry text-slate-800 font-bold"
          >
            {departmentList.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedStatus === st
                    ? 'bg-raspberry text-white shadow-2xs'
                    : 'bg-vanilla/50 text-slate-700 hover:bg-vanilla'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st === 'IN_PROGRESS' ? 'In Progress' : st === 'RESOLVED' ? 'Resolved' : 'Open'}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            className="ml-auto text-xs font-bold text-raspberry hover:text-pink-grapefruit flex items-center gap-1.5 transition"
            title="Refresh community feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Community Complaints Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-raspberry animate-spin mx-auto mb-2" />
          <p className="text-pink-grapefruit font-bold text-sm">Loading community civic reports...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-vanilla p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-vanilla text-raspberry rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1.5">No reports match your filter</h3>
          <p className="text-slate-600 text-sm mb-5 font-medium">
            Try adjusting your search query or select "All Civic Wards" to view complaints across the municipality.
          </p>
          <button
            onClick={() => {
              setSelectedWard('ALL');
              setSelectedDepartment('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="bg-raspberry hover:bg-pink-grapefruit text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onVote={handleVote}
              onAddComment={handleAddComment}
              currentUserId={currentUser?.id}
              currentUserName={currentUser?.full_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
