import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Award, ShieldCheck, Zap, Sparkles, Trophy, CheckCircle2, X, Star } from 'lucide-react';

export default function OfficerRewardsModal({ onClose, officerUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficerStats();
  }, []);

  const loadOfficerStats = async () => {
    setLoading(true);
    try {
      const stats = await api.getOfficerRewards(officerUser?.id || 'officer-active');
      setData(stats);
    } catch (err) {
      console.error('Failed to load officer rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-lemon" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-pink-grapefruit" />;
      case 'Award':
        return <Award className="w-5 h-5 text-lime" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-raspberry" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border-2 border-vanilla shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vanilla pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lemon/20 text-lemon flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-lemon" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-vanilla text-raspberry px-2.5 py-0.5 rounded-full border border-vanilla">
                Municipal Operations Recognition
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Officer Performance Rewards & Leaderboard
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
            Loading officer performance records...
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-raspberry to-pink-grapefruit p-6 rounded-2xl text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-xs text-vanilla font-bold uppercase tracking-wider block">
                  Officer Operational Merit Score
                </span>
                <span className="text-3xl font-black">{data.total_merit_points} Points</span>
                <p className="text-xs text-cream/90 mt-1 font-medium">
                  Earned via on-time resolutions & Gemini AI-verified repairs.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30">
                <Star className="w-8 h-8 text-lemon fill-lemon" />
              </div>
            </div>

            {/* Badges Grid */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Officer Merit Badges
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.badges?.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition ${
                      b.unlocked
                        ? 'bg-cream/40 border-lime/50 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-vanilla flex items-center justify-center shrink-0">
                      {getBadgeIcon(b.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{b.name}</span>
                        {b.unlocked && (
                          <span className="text-[9px] bg-lime text-white px-1.5 py-0.2 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Municipal Team Leaderboard */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Zonal Officer Leaderboard (Current Month)
              </h4>
              <div className="bg-white rounded-2xl border-2 border-vanilla overflow-hidden">
                <div className="divide-y divide-vanilla/60 text-xs">
                  {data.leaderboard?.map((entry) => (
                    <div
                      key={entry.rank}
                      className="p-3.5 flex items-center justify-between hover:bg-cream/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                            entry.rank === 1
                              ? 'bg-lemon text-slate-900'
                              : entry.rank === 2
                              ? 'bg-vanilla text-raspberry'
                              : 'bg-cream text-slate-600'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                        <div>
                          <span className="font-black text-slate-900 block">{entry.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {entry.ward} • {entry.resolutions} Issues Resolved
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-raspberry block">{entry.points} pts</span>
                        <span className="text-[10px] text-lime font-bold">
                          {entry.sla_rate} On-Time SLA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="pt-2 border-t border-vanilla flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-raspberry hover:bg-pink-grapefruit text-white text-xs font-black transition shadow-xs cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
