import React from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  Flame,
  Trophy,
  CalendarCheck,
  Medal,
  Swords,
  Crown,
  Lock,
} from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isUnlocked,
  unlockedAt,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Award':
        return Award;
      case 'Zap':
        return Zap;
      case 'Flame':
        return Flame;
      case 'Trophy':
        return Trophy;
      case 'CalendarCheck':
        return CalendarCheck;
      case 'Medal':
        return Medal;
      case 'Swords':
        return Swords;
      case 'Crown':
        return Crown;
      default:
        return Trophy;
    }
  };

  const Icon = getIcon(achievement.iconName);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isUnlocked
          ? 'bg-neutral-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
          : 'bg-neutral-950/40 border-neutral-800/80 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition ${
            isUnlocked
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          {isUnlocked ? <Icon size={22} /> : <Lock size={18} />}
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isUnlocked
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-neutral-800 text-neutral-500'
          }`}
        >
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white mb-1">{achievement.title}</h4>
        <p className="text-xs text-neutral-400 mb-2 leading-relaxed">{achievement.description}</p>
        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
          <span className="text-neutral-500">Requirement:</span>
          <span className="text-neutral-300 font-medium">{achievement.requirement}</span>
        </div>
        {isUnlocked && unlockedAt && (
          <span className="text-[10px] text-emerald-400/80 block mt-1">
            Achieved {new Date(unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
