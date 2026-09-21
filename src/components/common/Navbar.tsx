import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Search,
  PlusCircle,
  Shield,
  User as UserIcon,
  LogOut,
  Flame,
  ChevronDown,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { SearchModal } from './SearchModal';
import { storage } from '../../services/storage';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { currentUser, logout, switchRole, switchUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: currentUser ? '/dashboard' : '/' },
    { label: 'Feed', path: '/feed' },
    { label: 'Leaderboards', path: '/leaderboards' },
    { label: 'Challenges', path: '/challenges' },
    { label: 'Gyms', path: '/gyms' },
    { label: 'Friends', path: '/friends' },
  ];

  const allDemoUsers = storage.getUsers();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setIsRoleSwitcherOpen(false);
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setIsRoleSwitcherOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                <Dumbbell size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-numeric text-2xl font-bold tracking-wider text-white leading-none">
                  PR <span className="text-emerald-400">ARENA</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold leading-none mt-0.5">
                  Verified Strength
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-neutral-800/90 text-emerald-400 font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Admin Dashboard shortcut if admin/verifier */}
              {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'VERIFIER') && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    location.pathname === '/admin'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <Shield size={14} />
                  <span>Verifier Panel</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition flex items-center gap-2"
              title="Search athletes, gyms, lifts..."
            >
              <Search size={19} />
              <span className="hidden lg:inline text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                Search
              </span>
            </button>

            {/* Notifications */}
            {currentUser && <NotificationDropdown />}

            {/* Submit PR Button */}
            {currentUser && (
              <Link
                to="/submit-pr"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              >
                <PlusCircle size={15} strokeWidth={2.5} />
                <span>Submit PR</span>
              </Link>
            )}

            {/* User Profile Avatar / Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-neutral-900 border border-neutral-800/80 transition"
                >
                  {/* Streak indicator */}
                  <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded-full">
                    <Flame size={12} className="fill-orange-400 text-orange-400" />
                    <span>{currentUser.streak.current}d</span>
                  </div>

                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                  />
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-800">
                      <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-neutral-400 truncate">@{currentUser.username}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          Role: {currentUser.role}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          {currentUser.totalVerifiedPRs} Verified PRs
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={`/profile/${currentUser.id}`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        <UserIcon size={15} />
                        <span>My Fitness Profile</span>
                      </Link>

                      <Link
                        to="/gyms"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        <Building2 size={15} />
                        <span>My Gym ({currentUser.gymName || 'Select Gym'})</span>
                      </Link>

                      <Link
                        to="/submit-pr"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-400 hover:bg-neutral-800 transition font-medium sm:hidden"
                      >
                        <PlusCircle size={15} />
                        <span>Submit New PR</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsRoleSwitcherOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-400 hover:bg-neutral-800 transition text-left"
                      >
                        <Shield size={15} />
                        <span>Switch Persona / Role...</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-neutral-800">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-neutral-800 transition text-left"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Role / Athlete Switcher Modal for evaluating MVP as User, Verifier, or Admin */}
      {isRoleSwitcherOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setIsRoleSwitcherOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <span>Switch Role / Athlete Persona</span>
              </h3>
              <button
                onClick={() => setIsRoleSwitcherOpen(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Quickly test the platform from different perspectives: normal lifter submitting PRs, or officiating verifier approving/rejecting proof videos.
            </p>

            {/* Role Options */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(['USER', 'VERIFIER', 'ADMIN'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition ${
                    currentUser?.role === role
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
              <Users size={14} className="text-emerald-400" />
              <span>Switch Demo Account:</span>
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {allDemoUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSwitchUser(u.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                    currentUser?.id === u.id
                      ? 'bg-neutral-800 border-emerald-500/50'
                      : 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.profilePicture}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">{u.name}</span>
                      <span className="text-[10px] text-neutral-400">
                        @{u.username} • {u.gymName}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
