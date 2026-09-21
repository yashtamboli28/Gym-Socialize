import React, { useState } from 'react';
import { Trophy, Calendar, Users, CheckCircle2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { Challenge } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface ChallengeCardProps {
  challenge: Challenge;
  onChallengeUpdated?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onChallengeUpdated }) => {
  const { currentUser } = useAuth();
  const [showRules, setShowRules] = useState(false);
  const [isJoined, setIsJoined] = useState(challenge.joined || false);
  const [participantCount, setParticipantCount] = useState(challenge.participantCount);

  const handleJoin = () => {
    if (!currentUser) return;
    storage.joinChallenge(challenge.id, currentUser.id);
    setIsJoined(true);
    setParticipantCount((prev) => prev + 1);
    if (onChallengeUpdated) onChallengeUpdated();
  };

  const typeStyles = {
    INDIVIDUAL: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    GYM: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    FRIENDS: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <div
      id={`challenge-card-${challenge.id}`}
      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between"
    >
      {/* Banner */}
      <div className="relative h-32 w-full bg-neutral-950 overflow-hidden">
        <img
          src={challenge.bannerUrl}
          alt={challenge.title}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${typeStyles[challenge.type]}`}
          >
            {challenge.type} Challenge
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
            <Dumbbell size={13} className="text-emerald-400" />
            {challenge.exercise} {challenge.targetWeightKg ? `• ${challenge.targetWeightKg}kg Target` : ''}
          </span>
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Calendar size={12} />
            {challenge.durationDays} Days
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1.5">{challenge.title}</h3>
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">{challenge.description}</p>

          {/* Progress bar if joined */}
          {isJoined && (
            <div className="mb-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-neutral-400">Your Progress</span>
                <span className="text-emerald-400 font-semibold">{challenge.userProgress || 10}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${challenge.userProgress || 10}%` }}
                />
              </div>
            </div>
          )}

          {/* Rules Dropdown */}
          <div className="mb-3">
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Challenge Guidelines</span>
              {showRules ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showRules && (
              <ul className="mt-2 space-y-1 text-[11px] text-neutral-300 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                {challenge.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Users size={13} />
            {participantCount} Athletes Joined
          </span>

          {isJoined ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              Enrolled
            </span>
          ) : (
            <button
              onClick={handleJoin}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition shadow"
            >
              Join Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
