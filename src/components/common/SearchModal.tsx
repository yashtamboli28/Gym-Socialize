import React, { useState, useMemo } from 'react';
import { Search, X, Users, Dumbbell, Trophy, Building2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'gyms' | 'exercises' | 'challenges'>('all');
  const navigate = useNavigate();

  const allUsers = storage.getUsers();
  const allGyms = storage.getGyms();
  const allChallenges = storage.getChallenges();
  const EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row'];

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], gyms: [], exercises: [], challenges: [] };
    const q = query.toLowerCase();

    return {
      users: allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q)
      ),
      gyms: allGyms.filter(
        (g) => g.name.toLowerCase().includes(q) || g.city.toLowerCase().includes(q)
      ),
      exercises: EXERCISES.filter((e) => e.toLowerCase().includes(q)),
      challenges: allChallenges.filter(
        (c) => c.title.toLowerCase().includes(q) || c.exercise.toLowerCase().includes(q)
      ),
    };
  }, [query, allUsers, allGyms, allChallenges]);

  if (!isOpen) return null;

  const totalResults =
    results.users.length + results.gyms.length + results.exercises.length + results.challenges.length;

  const handleSelectUser = (id: string) => {
    onClose();
    navigate(`/profile/${id}`);
  };

  const handleSelectGym = (id: string) => {
    onClose();
    navigate(`/gyms?selected=${id}`);
  };

  const handleSelectExercise = (exercise: string) => {
    onClose();
    navigate(`/leaderboards?exercise=${encodeURIComponent(exercise)}`);
  };

  const handleSelectChallenge = () => {
    onClose();
    navigate(`/challenges`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800 bg-neutral-950/60">
          <Search size={20} className="text-neutral-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search lifters, gyms, exercises, challenges..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1 rounded-md"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/90 border-b border-neutral-800/60 text-xs overflow-x-auto">
          {(['all', 'users', 'gyms', 'exercises', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full capitalize transition font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              <Dumbbell size={32} className="mx-auto mb-2 opacity-40 text-emerald-400" />
              <p>Type to search across India’s verified strength network</p>
              <div className="flex justify-center gap-2 mt-4 text-[11px] text-neutral-400">
                <span>Try: "Rohan"</span>
                <span>•</span>
                <span>"Deadlift"</span>
                <span>•</span>
                <span>"Steelforge"</span>
                <span>•</span>
                <span>"100 KG"</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              <p>No results found matching "{query}"</p>
            </div>
          ) : (
            <>
              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
                    <Users size={14} className="text-emerald-400" />
                    <span>Athletes ({results.users.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/80 border border-neutral-800/60 hover:border-neutral-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.profilePicture}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                          />
                          <div>
                            <span className="text-sm font-semibold text-white block">{u.name}</span>
                            <span className="text-xs text-neutral-400">
                              @{u.username} • {u.gymName} • {u.totalVerifiedPRs} Verified PRs
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-neutral-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gyms */}
              {(activeTab === 'all' || activeTab === 'gyms') && results.gyms.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
                    <Building2 size={14} className="text-blue-400" />
                    <span>Gyms ({results.gyms.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.gyms.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleSelectGym(g.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/80 border border-neutral-800/60 hover:border-neutral-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={g.coverImage}
                            alt={g.name}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-700"
                          />
                          <div>
                            <span className="text-sm font-semibold text-white block">{g.name}</span>
                            <span className="text-xs text-neutral-400">
                              {g.city} • {g.memberCount} Lifters • {g.verifiedLiftsCount} Verified Lifts
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-neutral-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises */}
              {(activeTab === 'all' || activeTab === 'exercises') && results.exercises.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
                    <Dumbbell size={14} className="text-amber-400" />
                    <span>Exercises</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {results.exercises.map((ex) => (
                      <div
                        key={ex}
                        onClick={() => handleSelectExercise(ex)}
                        className="p-3 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/80 border border-neutral-800/60 hover:border-neutral-700 transition cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-white">{ex}</span>
                        <span className="text-xs text-emerald-400">View Rankings →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {(activeTab === 'all' || activeTab === 'challenges') && results.challenges.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
                    <Trophy size={14} className="text-purple-400" />
                    <span>Challenges ({results.challenges.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.challenges.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={handleSelectChallenge}
                        className="p-2.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/80 border border-neutral-800/60 hover:border-neutral-700 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-semibold text-white block">{ch.title}</span>
                          <span className="text-xs text-neutral-400">
                            {ch.exercise} • {ch.participantCount} Participants
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-neutral-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
