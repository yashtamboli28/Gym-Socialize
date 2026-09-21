import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Users,
  CheckCircle2,
  Trophy,
  Scale,
  Dumbbell,
  Check,
  X,
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Gym, User } from '../types';
import { GymCard } from '../components/cards/GymCard';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

export const GymsPage: React.FC = () => {
  const { currentUser, updateUserGym } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  const allGyms = storage.getGyms();
  const cities: string[] = Array.from(new Set(allGyms.map((g: Gym) => g.city)));

  // Query parameter selection
  useEffect(() => {
    const gymIdParam = searchParams.get('selected');
    if (gymIdParam) {
      const found = storage.getGymById(gymIdParam);
      if (found) setSelectedGym(found);
    }
  }, [searchParams]);

  const filteredGyms = allGyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'ALL' || g.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const gymMembers: User[] = selectedGym
    ? storage.getUsers().filter((u) => u.gymId === selectedGym.id)
    : [];

  const gymPRs = selectedGym
    ? storage.getPRs().filter((pr) => pr.gymId === selectedGym.id && pr.verificationStatus === 'APPROVED')
    : [];

  const handleSelectGym = (gym: Gym) => {
    setSelectedGym(gym);
    setSearchParams({ selected: gym.id });
  };

  const handleJoinGym = (gymId: string) => {
    updateUserGym(gymId);
    if (selectedGym) {
      setSelectedGym({ ...selectedGym });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
              Arena Gym Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Building2 size={28} className="text-blue-400" />
            <span>Gym Network & Leaderboards</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Join your training ground, represent your barbell club, and lift your gym to the top of the national standings.
          </p>
        </div>

        {currentUser?.gymName && (
          <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Your Affiliated Gym
              </span>
              <span className="text-xs font-bold text-white">{currentUser.gymName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Search and City Filters */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search gym by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <MapPin size={14} className="text-neutral-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Cities ({cities.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gym Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGyms.map((gym) => (
          <GymCard
            key={gym.id}
            gym={gym}
            onSelect={handleSelectGym}
            isSelected={selectedGym?.id === gym.id}
          />
        ))}
      </div>

      {/* Gym Detail Modal / Drawer */}
      {selectedGym && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => {
            setSelectedGym(null);
            setSearchParams({});
          }}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative h-48 w-full bg-neutral-950">
              <img
                src={selectedGym.coverImage}
                alt={selectedGym.name}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
              <button
                onClick={() => {
                  setSelectedGym(null);
                  setSearchParams({});
                }}
                className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/90 p-2 rounded-xl backdrop-blur-md transition"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 mb-1 inline-block">
                    {selectedGym.city}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">{selectedGym.name}</h2>
                </div>

                {currentUser?.gymId === selectedGym.id ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow">
                    <Check size={14} strokeWidth={3} /> Joined Gym
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoinGym(selectedGym.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    Set as My Gym
                  </button>
                )}
              </div>
            </div>

            {/* Gym Details Body */}
            <div className="p-6 space-y-6">
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {selectedGym.description}
              </p>

              {/* Stat counters */}
              <div className="grid grid-cols-3 gap-3 bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800 text-center">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Total Athletes
                  </span>
                  <span className="font-numeric text-2xl font-bold text-white">
                    {selectedGym.memberCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Verified Lifts
                  </span>
                  <span className="font-numeric text-2xl font-bold text-emerald-400">
                    {selectedGym.verifiedLiftsCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Verified Mass
                  </span>
                  <span className="font-numeric text-2xl font-bold text-white">
                    {(selectedGym.verifiedTotalWeightKg || 0).toLocaleString()} kg
                  </span>
                </div>
              </div>

              {/* Gym's Verified Best Lifts */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-400" />
                  <span>Gym Verified Records</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedGym.topLifters?.map((lifter) => (
                    <div
                      key={lifter.userId}
                      className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 flex items-center gap-2.5"
                    >
                      <img
                        src={lifter.profilePicture}
                        alt={lifter.name}
                        className="w-8 h-8 rounded-full object-cover border border-neutral-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {lifter.name}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                          {lifter.bestLift}: {lifter.weightKg}kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrolled Athletes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Users size={14} className="text-blue-400" />
                  <span>Enrolled Athletes ({gymMembers.length})</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {gymMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                        />
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            @{member.username} • {member.totalVerifiedPRs} Verified PRs
                          </span>
                        </div>
                      </div>
                      <VerifiedBadge size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
