import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFavorites = createAsyncThunk(
  'favorites/getFavorites',
  async (token: string | null, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/favorites/`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return await res.json(); // returns array of posts or ids
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/favorites/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [] as string[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.map((p: any) => p._id ?? p); // support array of posts or ids
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (!state.favorites.includes(action.payload)) state.favorites.push(action.payload);
      });
  },
});

export default favoritesSlice.reducer; 