import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, WorkoutStreak } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => boolean;
  signup: (data: {
    name: string;
    username: string;
    email: string;
    age: number;
    gender?: string;
    city: string;
    gymId: string;
    profilePicture?: string;
    bio?: string;
  }) => User;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  logTodayWorkout: () => WorkoutStreak | undefined;
  updateUserGym: (gymId: string) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Rohan Sharma (user-1) so preview immediately shows rich data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('prarena_active_user_id') || 'user-1';
    return storage.getUserById(savedId) || storage.getUsers()[0] || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prarena_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('prarena_active_user_id');
    }
  }, [currentUser]);

  const login = (email: string, _password?: string): boolean => {
    const user = storage.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signup = (data: {
    name: string;
    username: string;
    email: string;
    age: number;
    gender?: string;
    city: string;
    gymId: string;
    profilePicture?: string;
    bio?: string;
  }): User => {
    const gym = storage.getGymById(data.gymId);
    const created = storage.createUser({
      name: data.name,
      username: data.username.replace('@', ''),
      email: data.email,
      age: data.age,
      gender: data.gender || 'Not specified',
      city: data.city,
      gymId: data.gymId,
      gymName: gym?.name || 'Local Gym',
      profilePicture:
        data.profilePicture ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
      bio: data.bio || 'New lifter on PR Arena. Focused on clean form and verified PRs.',
      role: 'USER',
    });
    setCurrentUser(created);
    return created;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = storage.updateUser(currentUser.id, { role });
    if (updated) setCurrentUser({ ...updated });
  };

  const switchUser = (userId: string) => {
    const target = storage.getUserById(userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const logTodayWorkout = () => {
    if (!currentUser) return undefined;
    const newStreak = storage.logWorkoutToday(currentUser.id);
    if (newStreak) {
      setCurrentUser((prev) => (prev ? { ...prev, streak: newStreak } : null));
    }
    return newStreak;
  };

  const updateUserGym = (gymId: string) => {
    if (!currentUser) return;
    const updated = storage.joinGym(currentUser.id, gymId);
    if (updated) {
      setCurrentUser({ ...updated });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = storage.updateUser(currentUser.id, data);
    if (updated) {
      setCurrentUser({ ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        signup,
        logout,
        switchRole,
        switchUser,
        logTodayWorkout,
        updateUserGym,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
