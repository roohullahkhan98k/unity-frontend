import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/get/post?liveOnly=true`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/get/post?userId=${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch user posts');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async ({ formData, token }: { formData: FormData; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/add/post`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, formData, token }: { postId: string; formData: FormData; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/update/post/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update post');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/delete/post/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelPost = createAsyncThunk(
  'posts/cancelPost',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/cancel/post/${postId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel post');
      }
      const data = await res.json();
      return data.post; // Return the updated post
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const reactivatePost = createAsyncThunk(
  'posts/reactivatePost',
  async ({ postId, auctionDuration, token }: { postId: string; auctionDuration: number; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reactivate/post/${postId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ auctionDuration }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reactivate post');
      }
      const data = await res.json();
      return data.post; // Return the updated post
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const buyNow = createAsyncThunk(
  'posts/buyNow',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/buy-now/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to buy now');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const endAuction = createAsyncThunk(
  'posts/endAuction',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/end-auction/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to end auction');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [] as any[],
    loading: false,
    error: null as string | null,
    fetched: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePostCurrentPrice: (state, action) => {
      const { postId, newPrice } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.currentPrice = newPrice;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.fetched = true;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.fetched = true;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Cancel post
      .addCase(cancelPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Reactivate post
      .addCase(reactivatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Buy now
      .addCase(buyNow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyNow.fulfilled, (state, action) => {
        state.loading = false;
        // Update the post status to sold
        const index = state.posts.findIndex(post => post._id === action.payload.post._id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
      })
      .addCase(buyNow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // End auction
      .addCase(endAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endAuction.fulfilled, (state, action) => {
        state.loading = false;
        // Update the post status to sold or expired
        const index = state.posts.findIndex(post => post._id === action.payload.post._id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
      })
      .addCase(endAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updatePostCurrentPrice } = postsSlice.actions;
export default postsSlice.reducer;
