import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle2, XCircle, UserPlus, Heart, MessageSquare, Trophy, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Notification } from '../../types';

export const NotificationDropdown: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = currentUser ? storage.getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: Notification) => {
    storage.markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      storage.markAllAsRead(currentUser.id);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'PR_APPROVED':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'PR_REJECTED':
        return <XCircle size={16} className="text-rose-400" />;
      case 'NEW_FOLLOWER':
        return <UserPlus size={16} className="text-blue-400" />;
      case 'POST_LIKE':
        return <Heart size={16} className="text-rose-400 fill-rose-400/20" />;
      case 'POST_COMMENT':
        return <MessageSquare size={16} className="text-amber-400" />;
      case 'CHALLENGE_INVITE':
        return <Trophy size={16} className="text-purple-400" />;
      case 'COMPETITION_UPDATE':
        return <Swords size={16} className="text-orange-400" />;
      default:
        return <Bell size={16} className="text-neutral-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-950/40">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-800/50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                <Bell size={24} className="mx-auto mb-2 opacity-30 text-neutral-400" />
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-neutral-800/60 cursor-pointer transition flex items-start gap-3 ${
                    !n.read ? 'bg-neutral-950/50' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-neutral-800/80 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-white">{n.title}</span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
