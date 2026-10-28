'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  BookOpen,
  DollarSign,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  Trash2,
  X
} from 'lucide-react';
import { NotificationItem, User } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';

interface NotificationCenterProps {
  currentUser: User;
}

export default function NotificationCenter({ currentUser }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return getStoredData().notifications || [];
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync on storage change
  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredData().notifications || []);
    };
    window.addEventListener('coaching_storage_updated', handleUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter notifications relevant to current logged-in role
  const userRole = currentUser?.role || 'student';
  const roleFiltered = notifications.filter((item) => {
    if (!item.targetRole || item.targetRole === 'all') return true;
    if (item.targetRole === userRole) return true;
    if (item.targetUserId && item.targetUserId === currentUser?.id) return true;
    return false;
  });

  const unreadCount = roleFiltered.filter((n) => !n.isRead).length;

  const displayList = roleFiltered.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    saveStoredData('NOTIFICATIONS', updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => {
      if (!n.targetRole || n.targetRole === 'all' || n.targetRole === userRole) {
        return { ...n, isRead: true };
      }
      return n;
    });
    setNotifications(updated);
    saveStoredData('NOTIFICATIONS', updated);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveStoredData('NOTIFICATIONS', updated);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quiz':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'attendance':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'fee':
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case 'batch':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'doubt':
        return <HelpCircle className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white font-black text-[10px] ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:-right-4 sm:mt-2 w-auto sm:w-96 max-w-sm mx-auto sm:mx-0 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  Notifications
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold capitalize">
                    {userRole}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300">
                  {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-bold text-blue-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({roleFiltered.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {displayList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="text-xs font-bold text-slate-600">No new notifications</p>
                <p className="text-[11px]">Updates related to your {userRole} ID will appear here.</p>
              </div>
            ) : (
              displayList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-3.5 hover:bg-slate-50 transition-all cursor-pointer flex gap-3 group relative ${
                    !item.isRead ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className={`text-xs font-extrabold truncate ${!item.isRead ? 'text-blue-900 font-black' : 'text-slate-800'}`}>
                        {item.title}
                      </h5>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-semibold">
                      <span>{item.timestamp}</span>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          View ➜
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-all absolute top-2 right-2"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Real-time Alerts • ICC KE GURUJI Smart Hub</span>
          </div>
        </div>
      )}
    </div>
  );
}
