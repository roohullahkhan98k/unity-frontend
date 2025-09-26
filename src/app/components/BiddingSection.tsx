"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Clock, User, TrendingUp, History } from 'lucide-react';
import { placeBid, getBidsForPost, getWinningBid } from '../../store/bidsSlice';
import { updatePostCurrentPrice } from '../../store/postsSlice';
import { useToast } from '../hooks/useToast';
import useAuthToken from '../hooks/useAuthToken';
import type { RootState, AppDispatch } from '../../store/store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface BiddingSectionProps {
  post: {
    _id: string;
    title: string;
    currentPrice: number;
    startingPrice: number;
    buyNowPrice?: number;
    auctionEndTime: string;
    status: 'live' | 'sold' | 'expired' | 'cancelled';
    user: { username: string; _id: string };
  };
  currentUserId?: string;
}

export default function BiddingSection({ post, currentUserId }: BiddingSectionProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const showToast = useToast();
  
  const { bids, winningBid, loading } = useSelector((state: RootState) => state.bids);
  const { posts } = useSelector((state: RootState) => state.posts);

  // Check if current user is the owner
  useEffect(() => {
    if (currentUserId && post.user._id) {
      setIsOwner(currentUserId === post.user._id);
    }
  }, [currentUserId, post.user._id]);

  // Fetch bids and winning bid when component mounts
  useEffect(() => {
    if (post._id) {
      dispatch(getBidsForPost(post._id));
      dispatch(getWinningBid(post._id));
    }
  }, [dispatch, post._id]);

  // Update current price from Redux store
  useEffect(() => {
    const updatedPost = posts.find(p => p._id === post._id);
    if (updatedPost && updatedPost.currentPrice !== post.currentPrice) {
      // Update the post prop if needed
    }
  }, [posts, post._id, post.currentPrice]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showToast("Please login to place a bid", "error");
      return;
    }

    if (isOwner) {
      showToast("You cannot bid on your own auction", "error");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid bid amount", "error");
      return;
    }

    if (amount <= post.currentPrice) {
      showToast(`Bid must be higher than current price: $${post.currentPrice}`, "error");
      return;
    }

    if (amount < post.startingPrice) {
      showToast(`Bid must be at least $${post.startingPrice}`, "error");
      return;
    }

    try {
      const result = await dispatch(placeBid({ postId: post._id, amount, token })).unwrap();
      showToast("Bid placed successfully!", "success");
      setBidAmount("");
      
      // Update current price in posts store
      dispatch(updatePostCurrentPrice({ postId: post._id, newPrice: result.currentPrice }));
      
      // Refresh bids and winning bid
      dispatch(getBidsForPost(post._id));
      dispatch(getWinningBid(post._id));
    } catch (error: any) {
      showToast(error.message || "Failed to place bid", "error");
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getImageSrc = (profileImage: string | null | undefined) => {
    if (!profileImage) return undefined;
    if (profileImage.startsWith("http")) return profileImage;
    return `${BASE_URL}${profileImage}`;
  };

  const isLive = post.status === 'live' && new Date(post.auctionEndTime) > new Date();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Current Price and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Current Price</span>
          </div>
          <div className="text-2xl font-bold text-green-800">${post.currentPrice.toFixed(2)}</div>
          {winningBid && (
            <div className="text-xs text-green-600 mt-1">
              Leading bid by {winningBid.bidder?.username || 'Unknown'}
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Time Remaining</span>
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {isLive ? formatTimeRemaining(post.auctionEndTime) : 'Ended'}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Ends {formatDate(post.auctionEndTime)}
          </div>
        </div>
      </div>

      {/* Bidding Form */}
      {isLive && !isOwner && (
        <div className="mb-6">
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min={post.currentPrice + 0.01}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: $${(post.currentPrice + 0.01).toFixed(2)}`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum bid: ${(post.currentPrice + 0.01).toFixed(2)}
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !bidAmount}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Placing Bid...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Place Bid
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Owner Message */}
      {isOwner && isLive && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">You own this auction</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            You cannot bid on your own auction. Monitor the bidding activity below.
          </p>
        </div>
      )}

      {/* Buy Now Option */}
      {isLive && post.buyNowPrice && !isOwner && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Buy Now Price</span>
              </div>
              <div className="text-xl font-bold text-purple-800">${post.buyNowPrice.toFixed(2)}</div>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* Bid History Toggle */}
      {bids.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <History className="w-4 h-4" />
            {showBidHistory ? 'Hide' : 'Show'} Bid History ({bids.length} bids)
          </button>
        </div>
      )}

      {/* Bid History */}
      {showBidHistory && bids.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Bidding History</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {bids.map((bid, index) => (
              <div
                key={bid._id}
                className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 ${
                  bid.isWinning ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {bid.bidder?.profileImage ? (
                      <img
                        src={getImageSrc(bid.bidder.profileImage)}
                        alt={bid.bidder.username || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ${bid.bidder?.profileImage ? 'hidden' : ''}`}>
                      <span className="text-white font-bold text-xs">
                        {bid.bidder?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {bid.bidder?.username || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(bid.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">${bid.amount.toFixed(2)}</div>
                  {bid.isWinning && (
                    <div className="text-xs text-green-600 font-medium">Leading</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Bids Yet */}
      {bids.length === 0 && isLive && (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No bids yet</p>
          <p className="text-sm">Be the first to place a bid!</p>
        </div>
      )}
    </div>
  );
} 