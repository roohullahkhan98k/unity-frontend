import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ includeRead = false, token }: { includeRead?: boolean; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications?includeRead=${includeRead}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'An error occurred');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async ({ token }: { token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'An error occurred');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/read',
  async ({ id, token }: { id: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      return id;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'An error occurred');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/readAll',
  async ({ token }: { token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      return true;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'An error occurred');
    }
  }
);

interface Notification {
  _id: string;
  read: boolean;
  message: string;
  type: string;
  createdAt: string;
  [key: string]: unknown;
}

interface NotiState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasInitialized: boolean;
}

const initialState: NotiState = { items: [], unreadCount: 0, loading: false, error: null, hasInitialized: false };

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    reset(state) { state.items = []; state.unreadCount = 0; state.hasInitialized = false; },
    addNotification(state, action) {
      // Add new notification to the beginning of the list
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action) {
      const notification = state.items.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.hasInitialized = true;
        s.items = a.payload;
      })
      .addCase(fetchNotifications.rejected, (s, a) => { s.loading = false; s.hasInitialized = true; s.error = a.payload as string; })
      .addCase(fetchUnreadCount.fulfilled, (s, a) => {
        s.unreadCount = a.payload.unreadCount;
      })
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        const n = s.items.find(i => i._id === a.payload);
        if (n && !n.read) {
          n.read = true;
          s.unreadCount = Math.max(0, s.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (s) => {
        // Mark all notifications as read
        s.items.forEach(n => n.read = true);
        s.unreadCount = 0;
      });
  }
});

export const { reset, addNotification, markAsRead } = slice.actions;
export default slice.reducer; 