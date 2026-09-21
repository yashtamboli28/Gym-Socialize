import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  ShieldCheck,
  Trophy,
  Swords,
  Flame,
  CheckCircle2,
  Play,
  ArrowRight,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { storage } from '../services/storage';
import { PRSubmission } from '../types';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';

export const LandingPage: React.FC = () => {
  const [activeVideoPR, setActiveVideoPR] = useState<PRSubmission | null>(null);

  const sampleVerifiedPRs = storage
    .getPRs()
    .filter((pr) => pr.verificationStatus === 'APPROVED')
    .slice(0, 3);

  return (
    <div className="space-y-20 pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={16} />
            <span>The Verified Gym Performance Network</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            LIFT IT. PROVE IT. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
              OWN THE LEADERBOARD.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Zero self-reported numbers. Every PR on PR Arena requires video proof reviewed by human officiators. Compete on genuine leaderboards and fight for your gym’s glory.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/auth?mode=signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-sm transition shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              <span>Join PR Arena</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/leaderboards"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700 transition flex items-center justify-center gap-2"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Explore Verified Rankings</span>
            </Link>
          </div>

          {/* Micro stats banner */}
          <div className="pt-10 grid grid-cols-3 max-w-lg mx-auto border-t border-neutral-800/80 text-center">
            <div>
              <span className="font-numeric text-3xl font-extrabold text-white block">100%</span>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                Video Authenticated
              </span>
            </div>
            <div>
              <span className="font-numeric text-3xl font-extrabold text-emerald-400 block">
                5+
              </span>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                Official Gyms
              </span>
            </div>
            <div>
              <span className="font-numeric text-3xl font-extrabold text-white block">0</span>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                Fake PRs Allowed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            The Trust Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why PR Arena is Different from Typical Fitness Apps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Play size={22} className="fill-emerald-400/20" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Mandatory Video Proof</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Anyone can claim a 200kg squat in a text box. On PR Arena, a number does not exist without uncut video showing your full lift, range of motion, and loaded plates.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">2. Human Officiation Desk</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Lifts stay in PENDING VERIFICATION until certified referees inspect your lockout, depth angle, and bar path. Approved lifts receive the cryptographic green Verified Badge.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Swords size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">3. Gym vs Gym Battles</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Represent your facility. Real-time gym battle dashboards track verified lifts and total kilograms moved. Unverified submissions never contribute to gym scores.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Verified PRs Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Live Arena Showcase
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Recent Human-Verified Lifts
            </h2>
          </div>
          <Link
            to="/leaderboards"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            All Rankings →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleVerifiedPRs.map((pr) => (
            <div
              key={pr.id}
              onClick={() => setActiveVideoPR(pr)}
              className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden group cursor-pointer hover:border-neutral-700 transition"
            >
              <div className="relative h-48 w-full bg-neutral-950">
                <img
                  src={pr.thumbnailUrl}
                  alt={pr.exercise}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                <div className="absolute top-3 right-3">
                  <VerifiedBadge size="sm" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-900/80 group-hover:bg-emerald-500 text-white group-hover:text-neutral-950 flex items-center justify-center backdrop-blur-md transition">
                    <Play size={20} className="fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-numeric text-3xl font-extrabold text-white">
                      {pr.weight} {pr.unit}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{pr.exercise}</span>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-800/80">
                  <img
                    src={pr.userProfilePicture}
                    alt={pr.userName}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block">
                      {pr.userName}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate block">
                      {pr.gymName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideoPR && (
        <VideoPlayerModal pr={activeVideoPR} onClose={() => setActiveVideoPR(null)} />
      )}
    </div>
  );
};
