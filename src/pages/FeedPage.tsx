import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  Building2,
  Users,
  Image,
  Video,
  Send,
  Dumbbell,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { PostCard } from '../components/cards/PostCard';
import { Post, PRSubmission } from '../types';

export const FeedPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FOLLOWING' | 'MY_GYM'>('ALL');
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [linkedPRId, setLinkedPRId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const unsub = storage.subscribeToPRs(() => setRefreshTrigger((r) => r + 1));
    return () => unsub();
  }, []);

  // Available PRs for current user to link to post
  const userPRs = currentUser ? storage.getUserPRs(currentUser.id) : [];

  // Filter posts
  const posts = storage.getFeed(
    activeFilter === 'FOLLOWING' ? 'friends' : activeFilter === 'MY_GYM' ? 'gym' : 'all',
    currentUser?.id
  );

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !content.trim()) return;

    let prDetails = undefined;
    if (linkedPRId) {
      const pr = storage.getPRById(linkedPRId);
      if (pr) {
        prDetails = {
          exercise: pr.exercise,
          weight: pr.weight,
          unit: pr.unit,
          reps: pr.reps,
          isVerified: pr.verificationStatus === 'APPROVED',
        };
      }
    }

    storage.createPost({
      userId: currentUser.id,
      content,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? mediaType : undefined,
      prId: linkedPRId || undefined,
      prDetails,
    });

    setContent('');
    setMediaUrl('');
    setLinkedPRId('');
    setIsCreatingPost(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const SAMPLE_MEDIA = [
    {
      label: 'Gym Lifting Barbell Photo',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      type: 'photo' as const,
    },
    {
      label: 'Squat Rack Workout Photo',
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      type: 'photo' as const,
    },
    {
      label: 'Bench Press Gym Video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      type: 'video' as const,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass size={28} className="text-emerald-400" />
            <span>Athletic Feed</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Real daily training logs, verified personal bests, and community lifting updates.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setIsCreatingPost(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <PlusCircle size={16} strokeWidth={2.5} />
            <span>Create Post</span>
          </button>
        )}
      </div>

      {/* Feed Filters */}
      <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'ALL'
              ? 'bg-neutral-800 text-emerald-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Lifters
        </button>

        <button
          onClick={() => setActiveFilter('FOLLOWING')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeFilter === 'FOLLOWING'
              ? 'bg-neutral-800 text-emerald-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>Following</span>
        </button>

        <button
          onClick={() => setActiveFilter('MY_GYM')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeFilter === 'MY_GYM'
              ? 'bg-neutral-800 text-emerald-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 size={14} />
          <span>My Gym</span>
        </button>
      </div>

      {/* Create Post Modal / Composer */}
      {isCreatingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsCreatingPost(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                <span>Share Workout / PR Update</span>
              </h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                rows={4}
                placeholder="What did you lift today? Share sets, training insights, or new milestone notes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Attach a Verified PR option */}
              {userPRs.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Dumbbell size={14} className="text-emerald-400" />
                    <span>Attach one of your PRs to this post:</span>
                  </label>
                  <select
                    value={linkedPRId}
                    onChange={(e) => setLinkedPRId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None (Just workout post)</option>
                    {userPRs.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.exercise}: {pr.weight} {pr.unit} ({pr.verificationStatus})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Media URL Input or preset selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">
                  Optional Media Attachment:
                </label>
                <input
                  type="text"
                  placeholder="Paste image or video URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-neutral-400">Or sample media:</span>
                  {SAMPLE_MEDIA.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setMediaUrl(s.url);
                        setMediaType(s.type);
                      }}
                      className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300 hover:text-emerald-400 hover:border-neutral-700"
                    >
                      {s.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-bold text-xs transition flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>Publish to Arena</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
            <Compass size={36} className="mx-auto mb-3 opacity-30 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">No posts in this feed yet</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Follow lifters or create the first workout post from your gym!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={() => setRefreshTrigger((prev) => prev + 1)}
            />
          ))
        )}
      </div>
    </div>
  );
};
