import React from 'react';
import { Building2, MapPin, Users, CheckCircle2, ChevronRight } from 'lucide-react';
import { Gym } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface GymCardProps {
  gym: Gym;
  onSelect?: (gym: Gym) => void;
  isSelected?: boolean;
}

export const GymCard: React.FC<GymCardProps> = ({ gym, onSelect, isSelected = false }) => {
  const { currentUser, updateUserGym } = useAuth();
  const isUserGym = currentUser?.gymId === gym.id;

  const handleJoinGym = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateUserGym(gym.id);
  };

  return (
    <div
      id={`gym-card-${gym.id}`}
      onClick={() => onSelect && onSelect(gym)}
      className={`bg-neutral-900/90 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Cover Image */}
      <div className="relative h-36 w-full bg-neutral-950 overflow-hidden">
        <img
          src={gym.coverImage}
          alt={gym.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        {/* City Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-900/80 text-white backdrop-blur-md border border-neutral-800 flex items-center gap-1">
            <MapPin size={11} className="text-emerald-400" />
            {gym.city}
          </span>
        </div>

        {/* Member Status badge */}
        {isUserGym && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-neutral-950 flex items-center gap-1 shadow">
              <CheckCircle2 size={12} />
              Your Gym
            </span>
          </div>
        )}
      </div>

      {/* Gym Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5 mb-1">
            <span>{gym.name}</span>
          </h3>
          <p className="text-xs text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
            {gym.description}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80 text-xs mb-3">
            <div>
              <span className="text-[11px] text-neutral-400 block">Members</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Users size={12} className="text-neutral-400" />
                {gym.memberCount} Lifters
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block">Verified Lifts</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                {gym.verifiedLiftsCount}
              </span>
            </div>
          </div>

          {/* Top Lifters Avatars */}
          {gym.topLifters && gym.topLifters.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500 block mb-1.5">
                Top Rated Athletes
              </span>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {gym.topLifters.map((lifter) => (
                    <img
                      key={lifter.userId}
                      src={lifter.profilePicture}
                      alt={lifter.name}
                      title={`${lifter.name} (${lifter.bestLift}: ${lifter.weightKg}kg)`}
                      className="w-7 h-7 rounded-full object-cover border-2 border-neutral-900"
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-400 truncate">
                  {gym.topLifters[0].name} ({gym.topLifters[0].weightKg}kg {gym.topLifters[0].bestLift})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
          <button
            onClick={handleJoinGym}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
              isUserGym
                ? 'bg-neutral-800 text-neutral-400 cursor-default'
                : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-neutral-950 border border-emerald-500/30'
            }`}
          >
            {isUserGym ? 'Joined' : 'Select As My Gym'}
          </button>

          <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition flex items-center gap-0.5">
            Details <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};
