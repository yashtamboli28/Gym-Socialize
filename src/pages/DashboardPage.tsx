import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShieldCheck,
  Trophy,
  Swords,
  PlusCircle,
  Building2,
  Dumbbell,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { StatCard } from '../components/cards/StatCard';
import { PRCard } from '../components/cards/PRCard';
import { PostCard } from '../components/cards/PostCard';
import { CompetitionCard } from '../components/cards/CompetitionCard';

export const DashboardPage: React.FC = () => {
  const { currentUser, logTodayWorkout } = useAuth();
  const [, setRefresh] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = storage.subscribeToPRs(() => setRefresh((r) => r + 1));
    storage.syncUserPRsFromDB(currentUser.id).catch((e) => console.warn(e));
    return () => unsubscribe();
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const userPRs = storage.getPRsByUserId(currentUser.id);
  const pendingPRs = userPRs.filter((p) => p.verificationStatus === 'PENDING');
  const verifiedPRs = userPRs.filter((p) => p.verificationStatus === 'APPROVED');
  const userGym = storage.getGymById(currentUser.gymId);
  const competitions = storage.getCompetitions();
  const featuredBattle = competitions[0];
  const recentPosts = storage.getPosts().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Athlete Cockpit
              </span>
              <span className="text-xs text-neutral-500">•</span>
              <span className="text-xs text-neutral-400">{currentUser.city}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
              Representing <strong>{currentUser.gymName}</strong>. You have{' '}
              <strong className="text-emerald-400">{currentUser.totalVerifiedPRs} verified PRs</strong>{' '}
              on the official national leaderboards.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/submit-pr"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-2 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
            >
              <PlusCircle size={16} strokeWidth={2.5} />
              <span>Submit PR Proof</span>
            </Link>

            <button
              onClick={() => logTodayWorkout()}
              className="px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition flex items-center gap-2"
              title="Log workout today"
            >
              <Flame size={16} className="fill-orange-400 text-orange-400" />
              <span>Streak: {currentUser.streak.current}d</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified PRs"
          value={currentUser.totalVerifiedPRs}
          subtitle="Human reviewed & approved"
          icon={ShieldCheck}
          iconColor="text-emerald-400"
        />

        <StatCard
          title="Daily Streak"
          value={`${currentUser.streak.current} Days`}
          subtitle={`Personal Best: ${currentUser.streak.longest}d`}
          icon={Flame}
          iconColor="text-orange-400"
        />

        <StatCard
          title="Gym Verified Mass"
          value={`${userGym ? (userGym.verifiedTotalWeightKg || 0).toLocaleString() : 0} kg`}
          subtitle={userGym?.name || 'Affiliated Facility'}
          icon={Building2}
          iconColor="text-blue-400"
        />

        <StatCard
          title="Pending Queue"
          value={pendingPRs.length}
          subtitle={pendingPRs.length > 0 ? 'Awaiting referee review' : 'All submissions clear'}
          icon={Clock}
          iconColor="text-amber-400"
        />
      </div>

      {/* Pending Submissions Alert if any */}
      {pendingPRs.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-300">
            <Clock size={20} className="shrink-0 text-amber-400" />
            <div>
              <span className="font-bold block">
                You have {pendingPRs.length} PR submission(s) pending human verification.
              </span>
              <span className="text-neutral-400 text-[11px]">
                {pendingPRs.map((p) => `${p.exercise} (${p.weight}${p.unit})`).join(', ')}
              </span>
            </div>
          </div>
          <Link
            to={`/profile/${currentUser.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shrink-0"
          >
            Review Status →
          </Link>
        </div>
      )}

      {/* Main Split: Featured Gym Battle & My PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Gym Battle + Recent Verified PRs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Gym Battle */}
          {featuredBattle && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Swords size={18} className="text-orange-400" />
                  <span>Featured Gym vs Gym Battle</span>
                </h2>
                <Link
                  to="/challenges"
                  className="text-xs font-semibold text-emerald-400 hover:underline"
                >
                  View All Battles →
                </Link>
              </div>

              <CompetitionCard competition={featuredBattle} />
            </div>
          )}

          {/* Athlete's Recent PRs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-emerald-400" />
                <span>Your Personal Records</span>
              </h2>
              <Link
                to={`/profile/${currentUser.id}`}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                View Full Logbook →
              </Link>
            </div>

            {userPRs.length === 0 ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-400">
                <Dumbbell size={32} className="mx-auto mb-2 opacity-30 text-emerald-400" />
                <p className="text-xs">You haven't submitted any PRs yet.</p>
                <Link
                  to="/submit-pr"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
                >
                  Submit First PR
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userPRs.slice(0, 2).map((pr) => (
                  <PRCard key={pr.id} pr={pr} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Feed Highlights & Quick Leaderboards */}
        <div className="space-y-6">
          {/* Feed Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass size={18} className="text-emerald-400" />
                <span>Community Pulse</span>
              </h2>
              <Link to="/feed" className="text-xs font-semibold text-emerald-400 hover:underline">
                Open Feed →
              </Link>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
