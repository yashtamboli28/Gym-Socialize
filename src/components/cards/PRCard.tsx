import React, { useState } from 'react';
import { Play, Dumbbell, Calendar, Building2, AlertCircle } from 'lucide-react';
import { PRSubmission } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { VideoPlayerModal } from '../common/VideoPlayerModal';

interface PRCardProps {
  pr: PRSubmission;
  canReview?: boolean;
  onApprove?: (prId: string) => void;
  onReject?: (prId: string, reason: string) => void;
}

export const PRCard: React.FC<PRCardProps> = ({ pr, canReview = false, onApprove, onReject }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <div
        id={`pr-card-${pr.id}`}
        className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition duration-200 group flex flex-col justify-between"
      >
        {/* Top Media / Thumbnail Preview with Play button */}
        <div
          onClick={() => setIsVideoOpen(true)}
          className="relative h-44 sm:h-48 w-full bg-neutral-950 overflow-hidden cursor-pointer"
        >
          <img
            src={pr.thumbnailUrl}
            alt={pr.exercise}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />

          {/* Verification Status Pill */}
          <div className="absolute top-3 right-3 z-10">
            {pr.verificationStatus === 'APPROVED' && (
              <VerifiedBadge verifiedBy={pr.verifiedBy} verifiedAt={pr.verifiedAt} size="sm" />
            )}
            {pr.verificationStatus === 'PENDING' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                PENDING VERIFICATION
              </span>
            )}
            {pr.verificationStatus === 'REJECTED' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md">
                REJECTED
              </span>
            )}
          </div>

          {/* Exercise Label */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-900/80 text-neutral-200 backdrop-blur-md border border-neutral-800 flex items-center gap-1.5">
              <Dumbbell size={12} className="text-emerald-400" />
              {pr.exercise}
            </span>
          </div>

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-900/80 group-hover:bg-emerald-500 text-white group-hover:text-neutral-950 flex items-center justify-center backdrop-blur-md border border-neutral-700/80 group-hover:border-emerald-400 transition transform group-hover:scale-110 shadow-lg">
              <Play size={20} className="fill-current ml-0.5" />
            </div>
          </div>

          {/* Bottom Overlay Lifter info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <img
                src={pr.userProfilePicture}
                alt={pr.userName}
                className="w-6 h-6 rounded-full object-cover border border-neutral-700"
              />
              <span className="text-xs font-medium text-neutral-200 drop-shadow truncate max-w-[140px]">
                {pr.userName}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Calendar size={11} />
              {new Date(pr.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* PR Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-numeric text-4xl font-bold text-white tracking-wide">
                  {pr.weight}
                </span>
                <span className="text-emerald-400 font-semibold text-sm uppercase">{pr.unit}</span>
              </div>
              <span className="text-xs font-medium text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800/80">
                {pr.reps} {pr.reps === 1 ? 'rep (1RM)' : 'reps'}
              </span>
            </div>

            {/* Gym */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2 truncate">
              <Building2 size={13} className="text-neutral-500 shrink-0" />
              <span className="truncate">{pr.gymName}</span>
            </div>

            {/* Rejection notice */}
            {pr.verificationStatus === 'REJECTED' && pr.rejectionReason && (
              <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="line-clamp-2">{pr.rejectionReason}</span>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <button
              onClick={() => setIsVideoOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
            >
              Watch Video Proof →
            </button>

            {canReview && pr.verificationStatus === 'PENDING' && (
              <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Needs Officiation
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Inspection Modal */}
      {isVideoOpen && (
        <VideoPlayerModal
          pr={pr}
          onClose={() => setIsVideoOpen(false)}
          canReview={canReview}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </>
  );
};
