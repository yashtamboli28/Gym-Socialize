import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Building2,
  MapPin,
  Calendar,
  Flame,
  ShieldCheck,
  Trophy,
  Dumbbell,
  Grid,
  CheckCircle2,
  Clock,
  UserPlus,
  UserCheck,
  Edit3,
  PlusCircle,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { PRCard } from '../components/cards/PRCard';
import { PostCard } from '../components/cards/PostCard';
import { AchievementBadge } from '../components/cards/AchievementBadge';
import { PRSubmission } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, logTodayWorkout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'prs' | 'posts' | 'achievements'>('prs');
  const [prFilter, setPrFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [streakLoggedToast, setStreakLoggedToast] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncingPRs, setIsSyncingPRs] = useState(false);

  // Target user
  const profileUser = userId
    ? storage.getUserById(userId) || currentUser
    : currentUser;

  // Sync user's PRs from PostgreSQL database on mount or profile change
  useEffect(() => {
    if (!profileUser?.id) return;

    // 1. Subscribe to storage PR updates so UI refreshes automatically
    const unsubscribe = storage.subscribeToPRs(() => {
      setRefreshTrigger((prev) => prev + 1);
    });

    // 2. Fetch the user's PRs from backend / PostgreSQL to ensure permanent persistence
    setIsSyncingPRs(true);
    storage
      .syncUserPRsFromDB(profileUser.id)
      .catch((err) => console.warn('Could not sync user PRs from DB:', err))
      .finally(() => setIsSyncingPRs(false));

    return () => {
      unsubscribe();
    };
  }, [profileUser?.id]);

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-neutral-400">
        <UserIcon size={40} className="mx-auto mb-3 opacity-30" />
        <h2 className="text-lg font-bold text-white">Athlete profile not found</h2>
        <Link to="/feed" className="text-emerald-400 text-xs mt-2 inline-block">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = currentUser
    ? storage.isFollowing(currentUser.id, profileUser.id)
    : false;

  const userPRs = storage.getPRsByUserId(profileUser.id);
  const userPosts = storage.getPostsByUserId(profileUser.id);
  const allAchievements = storage.getAchievements();

  // Filter PRs
  const displayedPRs = userPRs.filter((pr) => {
    if (prFilter === 'VERIFIED') return pr.verificationStatus === 'APPROVED';
    if (prFilter === 'PENDING') return pr.verificationStatus === 'PENDING';
    return true;
  });

  const handleToggleFollow = () => {
    if (!currentUser) return;
    storage.toggleFollow(currentUser.id, profileUser.id);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogWorkout = () => {
    const updated = logTodayWorkout();
    if (updated) {
      setStreakLoggedToast(true);
      setTimeout(() => setStreakLoggedToast(false), 3000);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleSaveBio = () => {
    updateProfile({ bio: bioInput });
    setIsEditingBio(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Profile Avatar */}
            <div className="relative">
              <img
                src={profileUser.profilePicture}
                alt={profileUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-neutral-700 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2">
                <VerifiedBadge size="sm" showLabel={false} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{profileUser.name}</h1>
                <span className="text-xs text-neutral-400">@{profileUser.username}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {profileUser.role}
                </span>
              </div>

              {/* Gym & City */}
              <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 size={13} className="text-neutral-500" />
                  <Link to="/gyms" className="hover:text-emerald-400 transition">
                    {profileUser.gymName || 'Local Gym'}
                  </Link>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-neutral-500" />
                  {profileUser.city}
                </span>
                {profileUser.age && (
                  <>
                    <span>•</span>
                    <span>{profileUser.age} yrs</span>
                  </>
                )}
              </div>

              {/* Bio */}
              {!isEditingBio ? (
                <p className="text-xs sm:text-sm text-neutral-300 pt-1.5 max-w-xl leading-relaxed">
                  {profileUser.bio}
                </p>
              ) : (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1 text-xs text-white"
                  />
                  <button
                    onClick={handleSaveBio}
                    className="px-2.5 py-1 bg-emerald-500 text-neutral-950 text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="text-xs text-neutral-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBioInput(profileUser.bio);
                    setIsEditingBio(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>Edit Bio</span>
                </button>
                <Link
                  to="/submit-pr"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <PlusCircle size={15} />
                  <span>Submit PR</span>
                </Link>
              </div>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isFollowing
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={15} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Follow Lifter</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Row & Streak Banner */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Verified PRs
            </span>
            <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {profileUser.totalVerifiedPRs}
            </span>
          </div>

          <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Current Streak
            </span>
            <div className="flex items-center justify-center gap-1">
              <Flame size={18} className="fill-orange-400 text-orange-400" />
              <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-white">
                {profileUser.streak.current}d
              </span>
            </div>
          </div>

          <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Longest Streak
            </span>
            <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-neutral-300">
              {profileUser.streak.longest}d
            </span>
          </div>

          <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Followers / Following
            </span>
            <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-white">
              {profileUser.followersCount} <span className="text-xs text-neutral-500 font-normal">/ {profileUser.followingCount}</span>
            </span>
          </div>
        </div>

        {/* Workout Streak Logger CTA for own profile */}
        {isOwnProfile && (
          <div className="mt-4 p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-orange-300">
              <Flame size={18} className="shrink-0 fill-orange-400 text-orange-400" />
              <span>
                <strong>Daily Habit Engine:</strong> Lifted today? Log your workout to advance your verified training streak.
              </span>
            </div>
            <button
              onClick={handleLogWorkout}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold transition shrink-0"
            >
              Log Today's Workout (+1d)
            </button>
          </div>
        )}

        {streakLoggedToast && (
          <div className="absolute top-4 right-4 bg-orange-500 text-neutral-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xl animate-in fade-in flex items-center gap-2">
            <Flame size={16} className="fill-neutral-950" />
            <span>Streak updated! Keep building consistency.</span>
          </div>
        )}
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('prs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'prs'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Dumbbell size={14} />
            <span>Personal Records ({userPRs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid size={14} />
            <span>Posts ({userPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'achievements'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Trophy size={14} />
            <span>Badges & Trophies</span>
          </button>
        </div>

        {/* PR Status Sub-filter if in PR tab */}
        {activeTab === 'prs' && (
          <div className="hidden sm:flex items-center gap-1 text-xs">
            {(['ALL', 'VERIFIED', 'PENDING'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPrFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  prFilter === filter
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: PRs Grid */}
      {activeTab === 'prs' && (
        <div>
          {displayedPRs.length === 0 ? (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
              <Dumbbell size={36} className="mx-auto mb-3 opacity-30 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">No personal records found</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isOwnProfile
                  ? 'Submit your first PR with proof video to claim your verified badge!'
                  : 'This athlete has no PRs matching this filter.'}
              </p>
              {isOwnProfile && (
                <Link
                  to="/submit-pr"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
                >
                  <PlusCircle size={14} />
                  <span>Submit Video Proof</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPRs.map((pr) => (
                <PRCard key={pr.id} pr={pr} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Posts Grid */}
      {activeTab === 'posts' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {userPosts.length === 0 ? (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
              <Grid size={36} className="mx-auto mb-3 opacity-30 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">No community posts yet</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isOwnProfile
                  ? 'Share your daily workouts and gym PR updates to the feed!'
                  : 'This athlete hasn’t published any updates yet.'}
              </p>
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={() => setRefreshTrigger((prev) => prev + 1)}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 3: Achievements Grid */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map((achievement) => {
            const isUnlocked = (profileUser.achievements || []).includes(achievement.id);
            return (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
                unlockedAt={isUnlocked ? '2025-01-15' : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
