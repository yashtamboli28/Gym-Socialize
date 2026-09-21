import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Trophy, Flame, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();

  const items = [
    { label: 'Home', path: currentUser ? '/dashboard' : '/', icon: Home },
    { label: 'Feed', path: '/feed', icon: Compass },
    { label: 'Leaderboard', path: '/leaderboards', icon: Trophy },
    { label: 'Challenges', path: '/challenges', icon: Flame },
    {
      label: 'Profile',
      path: currentUser ? `/profile/${currentUser.id}` : '/auth?mode=login',
      icon: User,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1.5 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`
              }
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] mt-1 tracking-tight truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
