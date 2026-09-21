import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Send, Building2, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(
    currentUser ? post.likedBy.includes(currentUser.id) : false
  );
  const [likesCount, setLikesCount] = useState<number>(post.likesCount);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [comments, setComments] = useState(post.comments || []);
  const [shareToast, setShareToast] = useState(false);

  const handleToggleLike = () => {
    if (!currentUser) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    storage.toggleLike(post.id, currentUser.id);
    if (onPostUpdated) onPostUpdated();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentInput.trim()) return;

    const updated = storage.addComment(post.id, currentUser.id, commentInput);
    if (updated) {
      setComments(updated.comments);
      setCommentInput('');
      if (onPostUpdated) onPostUpdated();
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700/80 transition shadow-lg relative"
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.userId}`}>
            <img
              src={post.userProfilePicture}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover border border-neutral-700 hover:ring-2 hover:ring-emerald-500 transition"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${post.userId}`}
                className="text-sm font-semibold text-white hover:text-emerald-400 transition"
              >
                {post.userName}
              </Link>
              <span className="text-xs text-neutral-400">@{post.userUsername}</span>
            </div>
            {post.gymName && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Building2 size={11} className="text-neutral-500" />
                <span>{post.gymName}</span>
              </div>
            )}
          </div>
        </div>

        <span className="text-[11px] text-neutral-500">
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Verified PR Banner if attached */}
      {post.prDetails && (
        <div className="px-4 py-2.5 bg-neutral-950/70 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                {post.prDetails.exercise}: {post.prDetails.weight} {post.prDetails.unit}
              </span>
              <span className="text-[10px] text-neutral-400">
                {post.prDetails.reps} {post.prDetails.reps === 1 ? 'rep max' : 'reps'}
              </span>
            </div>
          </div>

          {post.prDetails.isVerified ? (
            <VerifiedBadge size="sm" />
          ) : (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Pending Verification
            </span>
          )}
        </div>
      )}

      {/* Post Text Caption */}
      <div className="px-4 pt-3.5 pb-2">
        <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Media Image / Video preview */}
      {post.mediaUrl && (
        <div className="relative w-full max-h-[460px] bg-neutral-950 overflow-hidden mt-2">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              className="w-full max-h-[460px] object-cover"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post workout media"
              className="w-full max-h-[460px] object-cover"
            />
          )}
        </div>
      )}

      {/* Action Buttons: Like, Comment, Share, Save */}
      <div className="p-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              isLiked ? 'text-rose-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart size={19} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <MessageSquare size={18} />
            <span>{comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="text-neutral-400 hover:text-white transition p-1"
            title="Share post"
          >
            <Share2 size={17} />
          </button>
        </div>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`transition ${isSaved ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
          title="Save post"
        >
          <Bookmark size={18} className={isSaved ? 'fill-emerald-400' : ''} />
        </button>
      </div>

      {shareToast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-neutral-950 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Comments Drawer */}
      {showComments && (
        <div className="bg-neutral-950/60 border-t border-neutral-800/80 p-4 space-y-3">
          {/* Comments List */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-2">No comments yet. Be the first to congratulate this lift!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.userProfilePicture}
                    alt={c.userName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-white">{c.userName}</span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-neutral-300">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 bg-emerald-500 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 rounded-xl transition font-semibold"
              >
                <Send size={14} />
              </button>
            </form>
          ) : (
            <p className="text-xs text-neutral-500 text-center">
              <Link to="/auth?mode=login" className="text-emerald-400 hover:underline">
                Log in
              </Link>{' '}
              to leave a comment.
            </p>
          )}
        </div>
      )}
    </article>
  );
};
