"use client";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, fetchUnreadCount } from '../../store/notificationsSlice';
import { useNotificationSync } from '../hooks/useNotificationSync';
import type { RootState, AppDispatch } from '../../store/store';
import SkeletonNotification from './SkeletonNotification';
import useAuthToken from '../hooks/useAuthToken';
import Avatar from './Avatar';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export default function NotificationDropdown() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, hasInitialized } = useSelector((s: RootState) => s.notifications);
  const token = useAuthToken();
  const { fetchNotifications: refreshNotifications } = useNotificationSync();
  
  const hasUnreadNotifications = items.some((n: { read: boolean }) => !n.read);

  useEffect(() => {
    if (!hasInitialized) dispatch(fetchNotifications({ includeRead: true, token }));
  }, [dispatch, hasInitialized, token]);

  // Refresh notifications when dropdown is visible
  useEffect(() => {
    if (hasInitialized) {
      refreshNotifications();
    }
  }, [hasInitialized, refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await dispatch(markNotificationRead({ id, token }));
    dispatch(fetchUnreadCount({ token }));
  };

  const handleClearAll = async () => {
    await dispatch(markAllNotificationsRead({ token }));
    dispatch(fetchUnreadCount({ token }));
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-50 transition-all duration-300 ease-in-out">
      {loading && !hasInitialized ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="space-y-3 w-full px-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonNotification key={i} />)}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center min-h-[120px] flex items-center justify-center">
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No notifications</p>
            <p className="text-gray-400 text-xs mt-1">You&apos;re all caught up!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="max-h-[400px] overflow-y-auto">
            {items.slice(0, 5).map((n: { _id: string; read: boolean; message: string; user?: { profileImage?: string; username?: string }; postTitle?: string; createdAt: string }) => (
              <button
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`flex gap-3 w-full text-left px-4 py-2 hover:bg-gray-50 ${!n.read ? 'bg-indigo-50' : ''}`}
              >
                <Avatar
                  src={n.user?.profileImage}
                  alt="Profile"
                  username={n.user?.username}
                  size="md"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  {n.postTitle && <p className="text-xs text-gray-500 mt-0.5">Post: {n.postTitle}</p>}
                  <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Clear All Button */}
          {hasUnreadNotifications && (
            <button
              onClick={handleClearAll}
              className="w-full py-2 text-center text-gray-600 hover:bg-gray-50 text-sm font-medium border-t border-gray-100"
            >
              Clear All
            </button>
                    )}
        </>
      )}
    </div>
  );
} 