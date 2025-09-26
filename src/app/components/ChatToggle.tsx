"use client";
import { useState } from 'react';
import { MessageCircle, X, Users } from 'lucide-react';
import AuctionChat from './AuctionChat';
import useAuthToken from '../hooks/useAuthToken';

interface ChatToggleProps {
  postId: string;
  postTitle: string;
}

export default function ChatToggle({ postId, postTitle }: ChatToggleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const token = useAuthToken();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (!token) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Conversation</h3>
          <p className="text-gray-600 mb-4">Login to participate in the auction chat</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Login to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Auction Chat</h3>
              <p className="text-sm text-indigo-100">{postTitle}</p>
            </div>
          </div>
          
          <button
            onClick={toggleChat}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
          >
            {isChatOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {isChatOpen && (
        <div className="h-96 bg-white">
          <AuctionChat postId={postId} postTitle={postTitle} />
        </div>
      )}

      {/* Collapsed State */}
      {!isChatOpen && (
        <div className="p-6 text-center">
          <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Click to open auction chat</p>
        </div>
      )}
    </div>
  );
} 