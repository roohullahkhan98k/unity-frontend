import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import favoritesReducer from './favoritesSlice';
import notificationsReducer from './notificationsSlice';
import bidsReducer from './bidsSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    bids: bidsReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 