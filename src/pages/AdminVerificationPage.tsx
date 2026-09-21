import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  AlertCircle,
  Dumbbell,
  Building2,
  Calendar,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { PRSubmission, ExerciseType } from '../types';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const AdminVerificationPage: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedExercise, setSelectedExercise] = useState<string>('ALL');
  const [activeReviewPR, setActiveReviewPR] = useState<PRSubmission | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allPRs = storage.getPRs();

  // Filtered list
  const filteredPRs = allPRs.filter((pr) => {
    const matchesTab = pr.verificationStatus === activeTab;
    const matchesExercise = selectedExercise === 'ALL' || pr.exercise === selectedExercise;
    return matchesTab && matchesExercise;
  });

  const pendingCount = allPRs.filter((pr) => pr.verificationStatus === 'PENDING').length;
  const approvedCount = allPRs.filter((pr) => pr.verificationStatus === 'APPROVED').length;
  const rejectedCount = allPRs.filter((pr) => pr.verificationStatus === 'REJECTED').length;

  const handleApprove = (prId: string) => {
    storage.approvePR(prId, currentUser?.name || 'Coach Balwant Singh (Admin)');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleReject = (prId: string, reason: string) => {
    storage.rejectPR(prId, reason, currentUser?.name || 'Coach Balwant Singh (Admin)');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Role Notice & Switcher */}
      {currentUser && currentUser.role === 'USER' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertCircle size={18} className="shrink-0" />
            <span>
              You are currently viewing as <strong>{currentUser.name} (USER)</strong>. Switch to <strong>VERIFIER / ADMIN</strong> to test approving or rejecting pending submissions.
            </span>
          </div>
          <button
            onClick={() => switchRole('VERIFIER')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shrink-0"
          >
            Switch to Verifier Role
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              Official Strength Tribunal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck size={28} className="text-emerald-400" />
            <span>PR Verification Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Human officiation ensures pure integrity: approve authentic lifts with verified badges or reject invalid attempts with referee feedback.
          </p>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Pending</span>
            <span className="font-numeric text-xl font-bold text-amber-400">{pendingCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Verified</span>
            <span className="font-numeric text-xl font-bold text-emerald-400">{approvedCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Rejected</span>
            <span className="font-numeric text-xl font-bold text-rose-400">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/80 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>Pending Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Approved ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <XCircle size={13} />
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        {/* Exercise Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-neutral-400" />
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Exercises</option>
            <option value="Bench Press">Bench Press</option>
            <option value="Squat">Squat</option>
            <option value="Deadlift">Deadlift</option>
            <option value="Overhead Press">Overhead Press</option>
            <option value="Barbell Row">Barbell Row</option>
          </select>
        </div>
      </div>

      {/* PR Table / Grid */}
      {filteredPRs.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
          <ShieldCheck size={36} className="mx-auto mb-3 opacity-30 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">No submissions in this queue</h3>
          <p className="text-xs text-neutral-500 mt-1">
            All lifts in the {activeTab.toLowerCase()} list have been addressed or no submissions match the filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPRs.map((pr) => (
            <div
              key={pr.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Lifter Info & Thumbnail */}
              <div className="flex items-start sm:items-center gap-4">
                {/* Thumbnail with quick watch trigger */}
                <div
                  onClick={() => setActiveReviewPR(pr)}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-neutral-950 overflow-hidden shrink-0 cursor-pointer group border border-neutral-800"
                >
                  <img
                    src={pr.thumbnailUrl}
                    alt={pr.exercise}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                    <Eye size={18} className="text-white drop-shadow" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{pr.userName}</span>
                    <span className="text-xs text-neutral-400">@{pr.userUsername}</span>
                    {pr.verificationStatus === 'APPROVED' && (
                      <VerifiedBadge verifiedBy={pr.verifiedBy} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                    <Building2 size={12} className="text-neutral-500" />
                    <span>{pr.gymName}</span>
                    <span>•</span>
                    <Calendar size={12} className="text-neutral-500" />
                    <span>{new Date(pr.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Weight details */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-numeric text-3xl font-extrabold text-white">
                      {pr.weight} {pr.unit}
                    </span>
                    <span className="text-xs text-neutral-400">
                      for {pr.reps} {pr.reps === 1 ? 'rep (1RM)' : 'reps'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {pr.exercise}
                    </span>
                  </div>

                  {/* Notes / Reason */}
                  {pr.notes && (
                    <p className="text-xs text-neutral-400 italic mt-1 line-clamp-1">
                      "{pr.notes}"
                    </p>
                  )}

                  {pr.rejectionReason && (
                    <p className="text-xs text-rose-300 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>Rejection Note: {pr.rejectionReason}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-end lg:self-center">
                <button
                  onClick={() => setActiveReviewPR(pr)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition flex items-center gap-2"
                >
                  <Eye size={15} />
                  <span>Inspect Video</span>
                </button>

                {pr.verificationStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(pr.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setActiveReviewPR(pr)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <X size={15} />
                      <span>Reject...</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {activeReviewPR && (
        <VideoPlayerModal
          pr={activeReviewPR}
          onClose={() => setActiveReviewPR(null)}
          canReview={true}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
