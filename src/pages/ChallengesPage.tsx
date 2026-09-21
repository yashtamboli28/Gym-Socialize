import React, { useState } from 'react';
import { Trophy, Swords, Flame, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { storage } from '../services/storage';
import { CompetitionCard } from '../components/cards/CompetitionCard';
import { ChallengeCard } from '../components/cards/ChallengeCard';

export const ChallengesPage: React.FC = () => {
  const [filterType, setFilterType] = useState<'ALL' | 'GYM' | 'INDIVIDUAL' | 'FRIENDS'>('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const competitions = storage.getCompetitions();
  const allChallenges = storage.getChallenges();

  const filteredChallenges = allChallenges.filter((ch) => {
    if (filterType === 'ALL') return true;
    return ch.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold">
              Arena Arena Showdown
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Swords size={28} className="text-orange-400" />
            <span>Gym Battles & Challenges</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Rally your gym. Compete in verified barbell battles where only validated proof lifts count toward your gym's total weight.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-2xl border border-emerald-500/30">
          <CheckCircle2 size={16} />
          <span>Only Verified PRs Count</span>
        </div>
      </div>

      {/* Featured Gym vs Gym Battles Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <h2 className="text-lg font-bold text-white">Live Gym vs Gym Battles</h2>
          </div>
          <span className="text-xs text-neutral-400">Official 7-Day Arena Clash</span>
        </div>

        <div className="space-y-6">
          {competitions.map((comp) => (
            <CompetitionCard key={comp.id} competition={comp} />
          ))}
        </div>
      </section>

      {/* Seasonal Challenges Section */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Open Strength Challenges</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'ALL'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({allChallenges.length})
            </button>
            <button
              onClick={() => setFilterType('GYM')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'GYM'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Gym Challenges
            </button>
            <button
              onClick={() => setFilterType('INDIVIDUAL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'INDIVIDUAL'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setFilterType('FRIENDS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'FRIENDS'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Friends Duels
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onChallengeUpdated={() => setRefreshTrigger((prev) => prev + 1)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
