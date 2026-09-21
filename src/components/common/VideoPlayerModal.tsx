import React, { useState, useRef } from 'react';
import { X, Play, Pause, RotateCcw, ShieldCheck, AlertCircle, Check, Info, Cloud, ExternalLink } from 'lucide-react';
import { PRSubmission } from '../../types';
import { VerifiedBadge } from './VerifiedBadge';

interface VideoPlayerModalProps {
  pr: PRSubmission | null;
  onClose: () => void;
  onApprove?: (prId: string) => void;
  onReject?: (prId: string, reason: string) => void;
  canReview?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  pr,
  onClose,
  onApprove,
  onReject,
  canReview = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [rejectMode, setRejectMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('Incorrect form');
  const [customReason, setCustomReason] = useState<string>('');

  if (!pr) return null;

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const REJECTION_REASONS = [
    'Incorrect form',
    'Weight not visible',
    'Full lift not visible',
    'Video unclear',
    'Exercise cannot be verified',
    'Duplicate submission',
    'Depth requirement not met (Squat)',
    'Buttocks lifted off bench (Bench Press)',
    'Bar hitching on thighs (Deadlift)',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <img
              src={pr.userProfilePicture}
              alt={pr.userName}
              className="w-10 h-10 rounded-full object-cover border border-neutral-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-base">{pr.userName}</h3>
                <span className="text-neutral-400 text-xs">@{pr.userUsername}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {pr.gymName} • {new Date(pr.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pr.verificationStatus === 'APPROVED' && (
              <VerifiedBadge verifiedBy={pr.verifiedBy} verifiedAt={pr.verifiedAt} size="md" />
            )}
            {pr.verificationStatus === 'PENDING' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PENDING VERIFICATION
              </span>
            )}
            {pr.verificationStatus === 'REJECTED' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                REJECTED
              </span>
            )}

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Video Stage & Controls */}
        <div className="relative bg-black flex-1 flex flex-col items-center justify-center min-h-[340px] max-h-[55vh] overflow-hidden group">
          <video
            ref={videoRef}
            src={pr.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain max-h-[52vh]"
          />

          {/* Quick HUD Overlay */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-neutral-800 text-white flex items-center gap-3 text-xs pointer-events-none">
            <span className="font-semibold text-emerald-400">{pr.exercise}</span>
            <span className="text-neutral-400">|</span>
            <span className="font-numeric text-xl font-bold tracking-wide text-white">
              {pr.weight} {pr.unit}
            </span>
            <span className="text-neutral-400">×</span>
            <span className="font-medium text-neutral-300">{pr.reps} {pr.reps === 1 ? 'rep' : 'reps'}</span>
          </div>

          {/* Video Control Bar */}
          <div className="absolute bottom-3 inset-x-4 bg-neutral-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-700/60 flex items-center justify-between opacity-95 transition">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={handleRestart}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition"
                title="Restart"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Slow Motion speed toggles */}
            <div className="flex items-center gap-1 bg-neutral-950/80 p-1 rounded-lg border border-neutral-800 text-xs">
              <span className="text-neutral-400 px-2 font-medium">Speed:</span>
              {[0.5, 0.75, 1].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    playbackRate === rate
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details & Reviewer Actions */}
        <div className="p-6 bg-neutral-900 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
              <span className="text-xs text-neutral-400 block mb-1">Lift Details</span>
              <div className="flex items-baseline gap-2">
                <span className="font-numeric text-3xl font-bold text-white">
                  {pr.weight} {pr.unit}
                </span>
                <span className="text-sm text-neutral-400">
                  for {pr.reps} {pr.reps === 1 ? 'rep' : 'reps'}
                </span>
              </div>
              <span className="text-xs text-emerald-400 mt-1 block font-medium">{pr.exercise}</span>
            </div>

            <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80 md:col-span-2">
              <span className="text-xs text-neutral-400 block mb-1">Athlete Notes</span>
              <p className="text-sm text-neutral-300 italic">
                {pr.notes ? `"${pr.notes}"` : 'No additional athlete notes provided.'}
              </p>
            </div>
          </div>

          {/* Rejection Reason Notice if already rejected */}
          {pr.verificationStatus === 'REJECTED' && pr.rejectionReason && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Officiator Rejection Reason:</span>
                <p>{pr.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Permanent Video Storage Indicator */}
          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <Cloud size={15} className="text-emerald-400 shrink-0" />
              <span>
                Storage:{' '}
                {pr.videoUrl.includes('cloudinary.com') ? (
                  <strong className="text-emerald-300">Cloudinary Permanent Storage</strong>
                ) : (
                  <span className="text-neutral-400">Persisted Video URL</span>
                )}
              </span>
            </div>
            {pr.videoUrl && (
              <a
                href={pr.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
              >
                <span>Direct Link</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Verification Protocol Notice (Future AI Pipeline preview + Human Officiation) */}
          <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-neutral-500" />
              <span>
                Verification Architecture: <strong>Human referee review</strong> assisted by pose and depth trajectory checks.
              </span>
            </div>
            {pr.aiAssistedMetrics && (
              <span className="text-neutral-500 font-mono text-[11px]">
                Pose Confidence: {pr.aiAssistedMetrics.depthConfidence}%
              </span>
            )}
          </div>

          {/* Review actions for Verifiers/Admins */}
          {canReview && pr.verificationStatus === 'PENDING' && (
            <div className="pt-2 border-t border-neutral-800/80">
              {!rejectMode ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (onApprove) onApprove(pr.id);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={18} strokeWidth={2.5} />
                    Approve PR (Mark as Official)
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-rose-950/50 hover:text-rose-400 text-neutral-300 font-medium text-sm border border-neutral-700 hover:border-rose-500/40 transition flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject PR...
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-rose-400">Select Rejection Reason (Mandatory):</span>
                    <button
                      onClick={() => setRejectMode(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {REJECTION_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                          selectedReason === reason
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rejectReason"
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="accent-rose-500"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Optional detailed feedback for the lifter..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />

                  <button
                    onClick={() => {
                      const finalReason = customReason
                        ? `${selectedReason}: ${customReason}`
                        : selectedReason;
                      if (onReject) onReject(pr.id, finalReason);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
                  >
                    Confirm Rejection & Send Feedback to Lifter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
