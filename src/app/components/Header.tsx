"use client";
import { usePathname } from 'next/navigation';
import { UserCircle, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { SidebarDrawer } from './Sidebar';
import { useEffect, useState } from "react";
import useAuthToken from "../hooks/useAuthToken";
import { useNotificationSync } from "../hooks/useNotificationSync";
import WalletConnectionStatus from './WalletConnectionStatus';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Profile = {
  userId: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string | null;
};

function getImageSrc(profileImage: string | null | undefined) {
  if (!profileImage) return '/placeholder-avatar.png';
  if (profileImage.startsWith("http")) return profileImage;
  return `${BASE_URL}${profileImage}`;
}

export default function Header() {
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register", "/forgot-password", "/"].includes(pathname);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthToken();
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);
  const [dropdownOpen,setDropdownOpen]=useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const { fetchNotifications: refreshNotifications, fetchUnreadCount: refreshUnreadCount } = useNotificationSync();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  // Fetch notifications when unread count increases (new notifications)
  useEffect(() => {
    if (token && unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      // New notifications arrived, fetch the updated list
      refreshNotifications();
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount, refreshNotifications, token]);

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="header-gradient w-full h-20 flex items-center justify-between px-6 z-20 relative">
      {/* Left section - Logo and mobile menu */}
      <div className="flex items-center gap-6">
        <div className="lg:hidden">
          <SidebarDrawer />
        </div>
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Unity Logo" 
            width={120}
            height={40}
            className="h-30 w-auto object-contain"
          />
        </div>
      </div>

      {/* Right section - Notifications, wallet status, and profile */}
      <div className="flex items-center gap-7">
        <div className="relative">
          <button 
            onClick={() => {
              setDropdownOpen(v => !v);
              // Refresh notifications when opening dropdown
              if (!dropdownOpen) {
                refreshNotifications();
                refreshUnreadCount();
              }
            }} 
            className="relative focus:outline-none header-button"
          >
            <Bell className="h-8 w-8 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </span>
            )}
          </button>
          {dropdownOpen && <NotificationDropdown />}
        </div>
        
        {/* Wallet Connection Status */}
        <WalletConnectionStatus />
        
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="h-11 w-11 flex items-center justify-center bg-gray-200 rounded-full">
              <svg className="animate-spin h-7 w-7 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </span>
          ) : profile && profile.profileImage ? (
            <Image
              src={getImageSrc(profile.profileImage)}
              alt="Profile"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
          ) : (
            <UserCircle className="h-11 w-11 text-gray-600" />
          )}
          <span className="font-semibold text-lg text-gray-700">{loading ? "..." : profile?.username || "User"}</span>
        </div>
      </div>
    </header>
  );
} 