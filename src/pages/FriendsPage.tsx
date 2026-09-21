import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  Building2,
  MapPin,
  Trophy,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const FriendsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allUsers = storage.getUsers();

  const followingUsers = currentUser
    ? storage.getFollowing(currentUser.id)
    : [];

  const followingIds = followingUsers.map((u) => u.id);

  const suggestedUsers = currentUser
    ? allUsers.filter(
        (u) => u.id !== currentUser.id && !followingIds.includes(u.id)
      )
    : allUsers;

  const handleToggleFollow = (targetUserId: string) => {
    if (!currentUser) return;
    storage.toggleFollow(currentUser.id, targetUserId);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            Community & Crew
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Users size={28} className="text-emerald-400" />
          <span>Friends & Training Partners</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Follow friends to see their daily verified PR attempts and compare head-to-head on private friend leaderboards.
        </p>
      </div>

      {/* Following Lifters Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Lifters You Follow</span>
            <span className="text-xs font-normal text-neutral-400">({followingUsers.length})</span>
          </h2>
          <Link
            to="/leaderboards"
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Friends Leaderboard →
          </Link>
        </div>

        {followingUsers.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-400">
            <Users size={32} className="mx-auto mb-2 opacity-30 text-emerald-400" />
            <p className="text-xs">You are not following any athletes yet.</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Explore suggestions below to connect with lifters in your gym or city.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <span className="text-sm font-bold text-white hover:text-emerald-400 transition block">
                        {user.name}
                      </span>
                      <span className="text-xs text-neutral-400">@{user.username}</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleToggleFollow(user.id)}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-rose-400 transition text-xs flex items-center gap-1"
                    title="Unfollow"
                  >
                    <UserCheck size={14} />
                  </button>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} /> {user.gymName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {user.city}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                    <span className="text-neutral-400">Verified PRs:</span>
                    <span className="text-emerald-400 font-bold">{user.totalVerifiedPRs}</span>
                  </div>
                </div>

                <Link
                  to={`/profile/${user.id}`}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold text-center transition"
                >
                  View Athlete Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Suggested Athletes Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Discover Lifters Around You</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4.5 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <span className="text-sm font-bold text-white hover:text-emerald-400 transition block">
                      {user.name}
                    </span>
                    <span className="text-xs text-neutral-400">@{user.username}</span>
                  </div>
                </Link>

                <button
                  onClick={() => handleToggleFollow(user.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1"
                >
                  <UserPlus size={13} />
                  <span>Follow</span>
                </button>
              </div>

              <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} /> {user.gymName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {user.city}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                  <span className="text-neutral-400">Verified PRs:</span>
                  <span className="text-emerald-400 font-bold">{user.totalVerifiedPRs}</span>
                </div>
              </div>

              <Link
                to={`/profile/${user.id}`}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold text-center transition"
              >
                View Athlete Profile
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
