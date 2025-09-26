import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  postId: string;
  userId: string;
  username: string;
  profileImage?: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system';
}

export interface ChatParticipant {
  userId: string;
  username: string;
  profileImage?: string;
  isTyping: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  currentPostId: string | null;
}

const initialState: ChatState = {
  messages: [],
  participants: [],
  isConnected: false,
  isTyping: false,
  error: null,
  currentPostId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    setCurrentPostId: (state, action: PayloadAction<string | null>) => {
      state.currentPostId = action.payload;
      if (!action.payload) {
        state.messages = [];
        state.participants = [];
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setParticipants: (state, action: PayloadAction<ChatParticipant[]>) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action: PayloadAction<ChatParticipant>) => {
      const existingIndex = state.participants.findIndex(p => p.userId === action.payload.userId);
      if (existingIndex >= 0) {
        state.participants[existingIndex] = action.payload;
      } else {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.userId !== action.payload);
    },
    setUserTyping: (state, action: PayloadAction<{ userId: string; isTyping: boolean }>) => {
      const participant = state.participants.find(p => p.userId === action.payload.userId);
      if (participant) {
        participant.isTyping = action.payload.isTyping;
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.participants = [];
      state.isTyping = false;
      state.error = null;
    },
  },
});

export const {
  setConnectionStatus,
  setCurrentPostId,
  addMessage,
  setMessages,
  setParticipants,
  addParticipant,
  removeParticipant,
  setUserTyping,
  setTyping,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer; 