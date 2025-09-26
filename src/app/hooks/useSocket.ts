import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setConnectionStatus, 
  setCurrentPostId, 
  addMessage, 
  setMessages,
  setParticipants, 
  addParticipant, 
  removeParticipant, 
  setUserTyping, 
  setError,
  clearChat 
} from '../../store/chatSlice';
import type { RootState, AppDispatch } from '../../store/store';
import useAuthToken from './useAuthToken';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8012';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const { currentPostId, isConnected } = useSelector((state: RootState) => state.chat);

  const connect = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    console.log('Attempting to connect to socket server:', SOCKET_URL);
    console.log('Token available:', !!token);
    console.log('Token length:', token.length);
    
    // Debug token structure
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token header:', header);
        console.log('Token payload:', payload);
        console.log('Token algorithm:', header.alg);
        console.log('Token expires:', new Date(payload.exp * 1000));
      }
    } catch (error: unknown) {
      console.log('Token parsing failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      transports: ['websocket', 'polling'],
      timeout: 10000, // 10 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      dispatch(setConnectionStatus(true));
      dispatch(setError(null));
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      dispatch(setConnectionStatus(false));
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        socketRef.current?.connect();
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      dispatch(setConnectionStatus(false));
      
      if (error.message.includes('invalid signature')) {
        dispatch(setError('Authentication failed. Please login again.'));
      } else if (error.message.includes('timeout')) {
        dispatch(setError('Connection timeout. Please check your internet connection.'));
      } else {
        dispatch(setError(`Connection failed: ${error.message}`));
      }
    });

    socketRef.current.on('error', (error: { message?: string }) => {
      console.error('Socket error:', error);
      dispatch(setError(error.message || 'Connection error'));
      
      // Handle specific errors
      switch (error.message) {
        case 'Authentication error: No token provided':
        case 'Authentication error: Invalid token':
        case 'Socket auth error: invalid signature':
          dispatch(setConnectionStatus(false));
          dispatch(setError('Authentication failed. Please login again.'));
          break;
        case 'Chat is disabled for this auction':
          dispatch(setError('Chat is disabled for this auction'));
          break;
      }
    });

    socketRef.current.on('new-message', (message: { _id: string; content: string; sender: { _id: string; username: string; profileImage?: string }; timestamp: string; postId: string }) => {
      console.log('Received message from backend:', message);
      console.log('Message structure:', JSON.stringify(message, null, 2));
      
      // Extract user data from the backend message structure
      const userData = message.sender || {};
      const username = userData.username;
      const userId = userData._id;
      const profileImage = userData.profileImage;
      
      console.log('Extracted username:', username);
      console.log('Extracted userId:', userId);
      console.log('Extracted profileImage:', profileImage);
      
      dispatch(addMessage({
        id: message._id || Date.now().toString(),
        postId: message.postId,
        userId: userId,
        username: username,
        profileImage: profileImage,
        message: message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        type: 'user',
      }));
    });

    socketRef.current.on('room-participants', (data: { participants: string[] }) => {
      console.log('Room participants event:', data);
      
      const participants = data.participants || [];
      console.log('Participants received:', participants);
      
      // Transform string[] to ChatParticipant[]
      const chatParticipants = participants.map(participant => ({
        userId: participant,
        username: participant, // Use participant as username for now
        profileImage: undefined,
        isTyping: false
      }));
      
      dispatch(setParticipants(chatParticipants));
    });

    socketRef.current.on('user-joined', (user: { _id: string; username: string; profileImage?: string }) => {
      console.log('User joined event:', user);
      
      // Handle both direct user object and nested user structure
      const userId = user._id;
      const username = user.username;
      const profileImage = user.profileImage;
      
      console.log('User joined - userId:', userId, 'username:', username);
      
      dispatch(addParticipant({
        userId: userId,
        username: username,
        profileImage: profileImage,
        isTyping: false,
      }));
    });

    socketRef.current.on('user-left', (user: { _id: string; username: string }) => {
      console.log('User left event:', user);
      
      const userId = user._id;
      
      dispatch(removeParticipant(userId));
    });

    socketRef.current.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('User typing event:', data);
      
      const userId = data.userId;
      
      dispatch(setUserTyping({
        userId: userId,
        isTyping: data.isTyping,
      }));
    });

    socketRef.current.on('chat-disabled', (data: { disabled: boolean; reason?: string }) => {
      console.log('Chat disabled event:', data);
      dispatch(setError(data.reason || 'Chat is disabled'));
    });

    socketRef.current.on('auction-event', (data: { type: string; postId: string; [key: string]: unknown }) => {
      console.log('Auction event:', data);
      if (data.type === 'auction-ended') {
        dispatch(setError('Auction has ended. Chat is now disabled.'));
      }
    });

    socketRef.current.on('system-message', (data: { message: string; type?: string }) => {
      console.log('System message:', data);
      dispatch(addMessage({
        id: Date.now().toString(),
        postId: currentPostId || '',
        userId: 'system',
        username: 'System',
        message: data.message,
        timestamp: new Date().toISOString(),
        type: 'system',
      }));
    });

  }, [token, dispatch, currentPostId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      dispatch(setConnectionStatus(false));
      dispatch(clearChat());
    }
  }, [dispatch]);

  const joinAuction = useCallback((postId: string) => {
    if (socketRef.current?.connected && postId) {
      socketRef.current.emit('join-auction', { postId });
      dispatch(setCurrentPostId(postId));
    }
  }, [dispatch]);

  const leaveAuction = useCallback((postId: string) => {
    if (socketRef.current?.connected && postId) {
      socketRef.current.emit('leave-auction', { postId });
      dispatch(setCurrentPostId(null));
    }
  }, [dispatch]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.connected && currentPostId && message.trim()) {
      socketRef.current.emit('send-message', {
        postId: currentPostId,
        message: message.trim(),
      });
    }
  }, [currentPostId]);

  const fetchMessages = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${postId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data);
        
        if (data.messages && Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map((msg: { _id: string; content: string; sender: { _id: string; username: string; profileImage?: string }; timestamp: string }) => ({
            id: msg._id,
            postId: postId,
            userId: msg.sender._id,
            username: msg.sender.username,
            profileImage: msg.sender.profileImage,
            message: msg.content,
            timestamp: msg.timestamp,
            type: 'user',
          }));
          
          dispatch(setMessages(formattedMessages));
        }
        
        if (!data.isActive) {
          console.log('Chat is disabled:', data.message);
        }
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [token, dispatch]);

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected && currentPostId) {
      socketRef.current.emit('typing-start', { postId: currentPostId });
    }
  }, [currentPostId]);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected && currentPostId) {
      socketRef.current.emit('typing-stop', { postId: currentPostId });
    }
  }, [currentPostId]);

  // Connect on mount and when token changes
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected,
    joinAuction,
    leaveAuction,
    sendMessage,
    fetchMessages,
    startTyping,
    stopTyping,
    disconnect,
  };
}; 