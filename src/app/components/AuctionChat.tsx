"use client";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Users, MessageCircle, AlertCircle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import useAuthToken from '../hooks/useAuthToken';
import { useCurrentUser } from '../hooks/useCurrentUser';
import ChatConnectionStatus from './ChatConnectionStatus';
import type { RootState } from '../../store/store';
import Image from 'next/image';
import Avatar from './Avatar';

interface AuctionChatProps {
  postId: string;
  postTitle: string;
}

export default function AuctionChat({ postId }: AuctionChatProps) {
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const token = useAuthToken();
  const currentUserId = useCurrentUser();
  const showToast = useToast();
  const { joinAuction, leaveAuction, sendMessage, startTyping, stopTyping, isConnected, fetchMessages } = useSocket();
  
  const { messages, participants, error } = useSelector((state: RootState) => state.chat);
  


  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join auction chat when component mounts
  useEffect(() => {
    if (isConnected && postId) {
      // Fetch existing messages first
      fetchMessages(postId).then(() => {
        setIsLoadingMessages(false);
      });
      
      // Then join the auction
      joinAuction(postId);
    }

    return () => {
      if (postId) {
        leaveAuction(postId);
      }
    };
  }, [isConnected, postId, joinAuction, leaveAuction, fetchMessages]);

  // Handle typing with debounce
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (isTyping) {
      startTyping();
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        stopTyping();
      }, 1000);
    } else {
      stopTyping();
    }

    return () => {
      clearTimeout(typingTimer);
    };
  }, [isTyping, startTyping, stopTyping]);

  const handleSendMessage = () => {
    if (!token) {
      showToast('Please login to send messages', 'error');
      return;
    }

    if (!message.trim()) return;

    sendMessage(message);
    setMessage('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid time';
    }
  };

  const getTypingUsers = () => {
    // Get all typing users EXCEPT the current user (we don't show ourselves typing)
    return participants
      .filter(p => p.isTyping && p.userId !== currentUserId)
      .map(p => p.username || 'Unknown User');
  };

  if (!token) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <ChatConnectionStatus />
          
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 rounded-lg px-3 py-1 text-sm text-indigo-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>{participants.length}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoadingMessages ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.userId === currentUserId;
                const isSystemMessage = msg.type === 'system';
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      isSystemMessage ? 'justify-center' : isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {isSystemMessage ? (
                      <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {msg.message}
                      </div>
                    ) : (
                      <>
                        {!isCurrentUser && (
                          <div className="flex-shrink-0">
                            <Avatar
                              src={msg.profileImage}
                              alt={msg.username || 'User avatar'}
                              username={msg.username}
                              size="sm"
                            />
                          </div>
                        )}
                        <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {msg.username || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`rounded-lg px-3 py-2 ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          {isCurrentUser && (
                            <div className="flex justify-end mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          )}
                        </div>
                        {isCurrentUser && (
                          <div className="flex-shrink-0">
                            {msg.profileImage ? (
                              <Image
                                src={msg.profileImage.startsWith('http') ? msg.profileImage : `${process.env.NEXT_PUBLIC_API_URL}${msg.profileImage}`}
                                alt={msg.username || 'User avatar'}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {msg.username ? msg.username.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator - Always visible at bottom */}
          {getTypingUsers().length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <p className="text-sm text-gray-600 italic">
                    {getTypingUsers().join(', ')} {getTypingUsers().length === 1 ? 'is' : 'are'} typing...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
            {error && error.includes('disabled') ? (
              <div className="text-center py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isTyping ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}
                    disabled={!isConnected}
                  />
                  {isTyping && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({participants.length})
              </h4>
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isCurrentUser = participant.userId === currentUserId;
                  return (
                    <div key={participant.userId} className={`flex items-center gap-2 ${isCurrentUser && isTyping ? 'bg-blue-50 rounded-lg p-2' : ''}`}>
                    <Avatar
                      src={participant.profileImage}
                      alt={participant.username || 'User avatar'}
                      username={participant.username}
                      size="sm"
                      className="w-6 h-6"
                    />
                    <span className="text-sm text-gray-700">{participant.username || 'Unknown User'}</span>
                    {participant.isTyping && participant.userId !== currentUserId && (
                      <span className="text-xs text-gray-500 italic">typing...</span>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 