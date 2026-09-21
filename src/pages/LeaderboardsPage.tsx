import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Trophy,
  Medal,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  Play,
  Filter,
  Dumbbell,
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ExerciseType, PRSubmission } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';

export const LeaderboardsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialExercise = (searchParams.get('exercise') as ExerciseType) || 'Deadlift';
  const [exercise, setExercise] = useState<ExerciseType>(initialExercise);
  const [scope, setScope] = useState<'ALL' | 'MY_GYM' | 'FRIENDS'>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [activeVideoPR, setActiveVideoPR] = useState<PRSubmission | null>(null);

  const EXERCISES: ExerciseType[] = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
  ];

  const gyms = storage.getGyms();
  const cities: string[] = Array.from(new Set(gyms.map((g) => g.city)));

  // Query verified leaderboards
  const rankings = useMemo(() => {
    return storage.getLeaderboard(exercise, {
      gymId: scope === 'MY_GYM' ? currentUser?.gymId : undefined,
      friendsOnly: scope === 'FRIENDS',
      currentUserId: currentUser?.id,
      gender: genderFilter !== 'ALL' ? genderFilter : undefined,
      city: cityFilter !== 'ALL' ? cityFilter : undefined,
    });
  }, [exercise, scope, genderFilter, cityFilter, currentUser]);

  const handleExerciseChange = (ex: ExerciseType) => {
    setExercise(ex);
    setSearchParams({ exercise: ex });
  };

  const getPodiumBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 flex items-center justify-center font-numeric font-bold text-sm shadow-[0_0_12px_rgba(251,191,36,0.3)]">
          <Trophy size={16} className="text-amber-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-numeric font-bold text-sm">
          <Medal size={16} className="text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-numeric font-bold text-sm">
          <Medal size={16} className="text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-numeric font-bold text-xs text-neutral-400">
        #{rank}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              Official Strength Rankings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Trophy size={28} className="text-amber-400" />
            <span>Verified Leaderboards</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Zero fake numbers. Every recorded personal record is authenticated by human referee review.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-2xl border border-emerald-500/30">
          <ShieldCheck size={16} />
          <span>Strict Officiation Rule Active</span>
        </div>
      </div>

      {/* Exercise Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {EXERCISES.map((ex) => (
          <button
            key={ex}
            onClick={() => handleExerciseChange(ex)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 ${
              exercise === ex
                ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Dumbbell size={14} />
            <span>{ex}</span>
          </button>
        ))}
      </div>

      {/* Scope and Filter Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Scope Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 w-full md:w-auto">
          <button
            onClick={() => setScope('ALL')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              scope === 'ALL'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            National (All Lifters)
          </button>
          <button
            onClick={() => setScope('MY_GYM')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              scope === 'MY_GYM'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 size={13} />
            <span>My Gym</span>
          </button>
          <button
            onClick={() => setScope('FRIENDS')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              scope === 'FRIENDS'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Friends</span>
          </button>
        </div>

        {/* Granular Filters: Gender & City */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400">Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {rankings.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
          <Trophy size={36} className="mx-auto mb-3 opacity-30 text-amber-400" />
          <h3 className="text-base font-semibold text-white">No verified lifts yet</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Be the first lifter to submit and verify a {exercise} PR under these filter criteria!
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                  <th className="py-4 px-4 sm:px-6">Athlete</th>
                  <th className="py-4 px-4 sm:px-6">Affiliated Gym</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Verified 1RM / PR</th>
                  <th className="py-4 px-4 sm:px-6 text-center">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Proof Video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {rankings.map((item) => {
                  const isCurrent = currentUser?.id === item.userId;
                  return (
                    <tr
                      key={item.submissionId}
                      className={`hover:bg-neutral-800/40 transition ${
                        isCurrent ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 sm:px-6">{getPodiumBadge(item.rank)}</td>

                      {/* Athlete */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.userProfilePicture}
                            alt={item.userName}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{item.userName}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400">
                              @{item.userUsername}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gym */}
                      <td className="py-4 px-4 sm:px-6 text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-neutral-500" />
                          <span className="font-medium">{item.gymName}</span>
                        </div>
                      </td>

                      {/* Verified PR */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="font-numeric text-2xl font-black text-white">
                            {item.weight}
                          </span>
                          <span className="text-emerald-400 font-bold uppercase text-xs">
                            {item.unit}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {item.reps} {item.reps === 1 ? 'rep (1RM)' : 'reps'}
                        </span>
                      </td>

                      {/* Verified Badge */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <VerifiedBadge verifiedBy={item.verifiedBy} verifiedAt={item.verifiedAt} size="sm" />
                      </td>

                      {/* Proof Action */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => {
                            const fullPR = storage.getPRById(item.submissionId);
                            if (fullPR) setActiveVideoPR(fullPR);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-semibold text-xs border border-neutral-700 transition"
                        >
                          <Play size={11} className="fill-emerald-400" />
                          <span>Watch Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideoPR && (
        <VideoPlayerModal pr={activeVideoPR} onClose={() => setActiveVideoPR(null)} />
      )}
    </div>
  );
};
