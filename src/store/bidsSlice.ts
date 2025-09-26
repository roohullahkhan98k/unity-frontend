import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const placeBid = createAsyncThunk(
  'bids/placeBid',
  async ({ postId, amount, token }: { postId: string; amount: number; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to place bid');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getBidsForPost = createAsyncThunk(
  'bids/getBidsForPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/post/${postId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch bids');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getWinningBid = createAsyncThunk(
  'bids/getWinningBid',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/winning/${postId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch winning bid');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserBids = createAsyncThunk(
  'bids/getUserBids',
  async (token: string | null, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/user/history`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch user bids');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const sellToBidder = createAsyncThunk(
  'bids/sellToBidder',
  async ({ postId, bidderId, token }: { postId: string; bidderId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/sell/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bidderId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to sell to bidder');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const sellToHighestBidder = createAsyncThunk(
  'bids/sellToHighestBidder',
  async ({ postId, token }: { postId: string; token: string | null }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/sell-highest/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to sell to highest bidder');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getBiddersForPost = createAsyncThunk(
  'bids/getBiddersForPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bids/bidders/${postId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch bidders');
      }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [] as any[],
    winningBid: null as any,
    userBids: [] as any[],
    bidders: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBids: (state) => {
      state.bids = [];
      state.winningBid = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place bid
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update winning bid
        state.winningBid = action.payload.bid;
        // Add new bid to bids list
        state.bids.unshift(action.payload.bid);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get bids for post
      .addCase(getBidsForPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidsForPost.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(getBidsForPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get winning bid
      .addCase(getWinningBid.fulfilled, (state, action) => {
        state.winningBid = action.payload;
      })
      // Get user bids
      .addCase(getUserBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBids.fulfilled, (state, action) => {
        state.loading = false;
        state.userBids = action.payload;
      })
      .addCase(getUserBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sell to bidder
      .addCase(sellToBidder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sellToBidder.fulfilled, (state, action) => {
        state.loading = false;
        // Clear bids after successful sale
        state.bids = [];
        state.winningBid = null;
        state.bidders = [];
      })
      .addCase(sellToBidder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sell to highest bidder
      .addCase(sellToHighestBidder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sellToHighestBidder.fulfilled, (state, action) => {
        state.loading = false;
        // Clear bids after successful sale
        state.bids = [];
        state.winningBid = null;
        state.bidders = [];
      })
      .addCase(sellToHighestBidder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get bidders for post
      .addCase(getBiddersForPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBiddersForPost.fulfilled, (state, action) => {
        state.loading = false;
        state.bidders = action.payload;
      })
      .addCase(getBiddersForPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBids } = bidsSlice.actions;
export default bidsSlice.reducer; 