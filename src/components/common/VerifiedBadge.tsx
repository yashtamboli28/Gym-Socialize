import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showLabel = true,
  verifiedBy,
  verifiedAt,
  className = '',
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <>
      <button
        type="button"
        id={`verified-badge-${verifiedBy ? 'official' : 'standard'}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowInfoModal(true);
        }}
        title="Verified PR by human officiation"
        className={`inline-flex items-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400/70 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)] ${sizeClasses[size]} ${className}`}
      >
        <CheckCircle2 size={iconSizes[size]} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
        {showLabel && <span className="tracking-wide uppercase">Verified PR</span>}
      </button>

      {/* Info Modal explaining Human Officiation Trust Principle */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100 p-1.5 rounded-lg hover:bg-neutral-800 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Human-Verified Lift</h3>
                <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">Official PR Arena Standard</span>
              </div>
            </div>

            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
              On PR Arena, numbers are never assumed. Every verified badge represents an unedited proof video reviewed and approved by certified gym officiators or referees for full range of motion, lockout, and visible plate weights.
            </p>

            <div className="bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-800/80 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Verification Authority:</span>
                <span className="text-neutral-200 font-medium">{verifiedBy || 'Certified Officiator'}</span>
              </div>
              {verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Verified Timestamp:</span>
                  <span className="text-neutral-200 font-mono">
                    {new Date(verifiedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">Leaderboard Eligibility:</span>
                <span className="text-emerald-400 font-semibold">100% Eligible</span>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
