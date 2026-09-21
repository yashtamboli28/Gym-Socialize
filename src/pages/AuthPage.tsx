import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Dumbbell,
  Shield,
  Building2,
  MapPin,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const { login, signup, switchUser } = useAuth();
  const navigate = useNavigate();

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign-up Form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('New Delhi');
  const [gymId, setGymId] = useState('gym-1');
  const [isCustomGym, setIsCustomGym] = useState(false);
  const [customGymName, setCustomGymName] = useState('');
  const [bio, setBio] = useState('');

  const gyms = storage.getGyms();
  const demoUsers = storage.getUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setLoginError('Invalid email or account not found in demo storage.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetGymId = gymId;
    if (isCustomGym && customGymName.trim()) {
      const createdGym = storage.createGym({
        name: customGymName.trim(),
        city,
        location: `${city} Central`,
        description: 'Independent training facility on PR Arena.',
        coverImage:
          'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop',
      });
      targetGymId = createdGym.id;
    }

    signup({
      name,
      username: username || name.toLowerCase().replace(/\s+/g, '_'),
      email: signupEmail,
      age: Number(age),
      gender,
      city,
      gymId: targetGymId,
      bio,
    });

    navigate('/dashboard');
  };

  const handlePickDemoAccount = (u: (typeof demoUsers)[0]) => {
    switchUser(u.id);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 pb-24">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg">
            <Dumbbell size={22} className="stroke-[2.5]" />
          </div>
          <span className="font-numeric text-3xl font-extrabold text-white">
            PR <span className="text-emerald-400">ARENA</span>
          </span>
        </Link>
        <p className="text-xs text-neutral-400">
          The verified gym performance network. Connect with your facility and prove your strength.
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Toggle Mode */}
        <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800/80 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === 'login'
                ? 'bg-neutral-800 text-emerald-400 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === 'signup'
                ? 'bg-neutral-800 text-emerald-400 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Athlete Profile
          </button>
        </div>

        {/* 1-Click Fast Login / Demo Switcher */}
        <div className="mb-6 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Quick 1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoUsers.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handlePickDemoAccount(u)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition flex items-center gap-2 group"
              >
                <img
                  src={u.profilePicture}
                  alt={u.name}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 truncate block">
                    {u.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                    {u.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition mt-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Sign In to PR Arena
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. arjun_lifts"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="arjun@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Age</label>
                <input
                  type="number"
                  min="13"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Gym Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300">
                  Select Affiliated Gym
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomGym(!isCustomGym)}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  {isCustomGym ? 'Choose Existing' : '+ Add New Gym'}
                </button>
              </div>

              {!isCustomGym ? (
                <select
                  value={gymId}
                  onChange={(e) => setGymId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.city})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter your gym name..."
                  value={customGymName}
                  onChange={(e) => setCustomGymName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Bio (Optional)</label>
              <textarea
                rows={2}
                placeholder="Strength goals, training background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition mt-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Complete Registration & Join Arena
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
