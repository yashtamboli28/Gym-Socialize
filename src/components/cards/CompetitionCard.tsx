import React from 'react';
import { Swords, CheckCircle2, Trophy, Scale, Users, Flame } from 'lucide-react';
import { Competition } from '../../types';

interface CompetitionCardProps {
  competition: Competition;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  const { gymA, gymB } = competition;

  const totalLifts = gymA.verifiedLifts + gymB.verifiedLifts;
  const gymAPercentage = totalLifts > 0 ? Math.round((gymA.verifiedLifts / totalLifts) * 100) : 50;
  const gymBPercentage = 100 - gymAPercentage;

  const isGymALeading = gymA.verifiedLifts >= gymB.verifiedLifts;

  return (
    <div
      id={`competition-card-${competition.id}`}
      className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Swords size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                Live Gym Battle
              </span>
              <span className="text-xs text-neutral-400 font-semibold">{competition.exercise}</span>
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              {competition.title}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <CheckCircle2 size={12} />
            Verified Lifts Only
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mb-6">{competition.subtitle}</p>

      {/* Head to Head Duel Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* VS Badge in Center */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-neutral-950 border border-neutral-700 items-center justify-center text-neutral-400 text-xs font-black shadow-lg">
          VS
        </div>

        {/* Gym A */}
        <div
          className={`p-5 rounded-2xl border transition ${
            isGymALeading
              ? 'bg-neutral-950/80 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={gymA.logo}
                alt={gymA.name}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{gymA.name}</h4>
                <span className="text-xs text-neutral-400">{gymA.city}</span>
              </div>
            </div>
            {isGymALeading && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Trophy size={11} /> Leading
              </span>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Verified Lifts
              </span>
              <span className="font-numeric text-3xl font-bold text-white">
                {gymA.verifiedLifts}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
              <span className="text-neutral-400 flex items-center gap-1">
                <Scale size={12} /> Total Verified Weight
              </span>
              <span className="font-semibold text-neutral-200">
                {gymA.totalWeightKg.toLocaleString()} kg
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1">
                <Users size={12} /> Lifters Involved
              </span>
              <span className="font-semibold text-neutral-200">{gymA.participantsCount}</span>
            </div>
          </div>
        </div>

        {/* Gym B */}
        <div
          className={`p-5 rounded-2xl border transition ${
            !isGymALeading
              ? 'bg-neutral-950/80 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-neutral-950/50 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={gymB.logo}
                alt={gymB.name}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{gymB.name}</h4>
                <span className="text-xs text-neutral-400">{gymB.city}</span>
              </div>
            </div>
            {!isGymALeading && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Trophy size={11} /> Leading
              </span>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Verified Lifts
              </span>
              <span className="font-numeric text-3xl font-bold text-white">
                {gymB.verifiedLifts}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
              <span className="text-neutral-400 flex items-center gap-1">
                <Scale size={12} /> Total Verified Weight
              </span>
              <span className="font-semibold text-neutral-200">
                {gymB.totalWeightKg.toLocaleString()} kg
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1">
                <Users size={12} /> Lifters Involved
              </span>
              <span className="font-semibold text-neutral-200">{gymB.participantsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tug of War Dynamic Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-emerald-400">{gymA.name}: {gymAPercentage}%</span>
          <span className="text-neutral-400">{gymB.name}: {gymBPercentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${gymAPercentage}%` }}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${gymBPercentage}%` }}
          />
        </div>
      </div>

      {/* Trust Notice */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <Flame size={12} className="text-orange-400" />
          Duration: 7 Days • Active Season
        </span>
        <span className="text-neutral-400 italic">
          Unverified uploads strictly excluded from gym score
        </span>
      </div>
    </div>
  );
};
