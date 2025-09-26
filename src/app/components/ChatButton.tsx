"use client";
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import AuctionChat from './AuctionChat';
import useAuthToken from '../hooks/useAuthToken';
import type { RootState } from '../../store/store';

interface ChatButtonProps {
  postId: string;
  postTitle: string;
}

export default function ChatButton({ postId, postTitle }: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = useAuthToken();
  const { messages } = useSelector((state: RootState) => state.chat);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0); // Clear unread count when opening chat
    }
  };

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!isChatOpen && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isChatOpen]);

  if (!token) {
    return null; // Don't show chat button for non-authenticated users
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-50 group"
        aria-label="Open auction chat"
      >
        {isChatOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {/* Notification badge */}
        {!isChatOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] z-40">
          <AuctionChat postId={postId} postTitle={postTitle} />
        </div>
      )}
    </>
  );
} 