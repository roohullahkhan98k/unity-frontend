"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Clock, DollarSign, User, Zap } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite } from "../../../store/favoritesSlice";
import { useToast } from "../../hooks/useToast";
import useAuthToken from "../../hooks/useAuthToken";
import { useCountdown } from "../../hooks/useCountdown";
import BiddingSection from "../../components/BiddingSection";
import SellerActions from "../../components/SellerActions";
import ChatToggle from "../../components/ChatToggle";
import type { RootState, AppDispatch } from "../../../store/store";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Post = {
  _id: string;
  user: { username: string; email: string; profileImage?: string; _id: string };
  images: string[];
  video?: string;
  title: string;
  description: string;
  createdAt: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  auctionDuration: number;
  auctionEndTime: string;
  status: 'live' | 'sold' | 'expired' | 'cancelled';
  soldTo?: { username: string; profileImage?: string };
  soldAt?: string;
  soldPrice?: number;
  soldVia?: 'auction' | 'buyNow';
};

export default function AuctionDetails() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Use custom countdown hook
  const timeRemaining = useCountdown(post?.auctionEndTime || null);
  
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const showToast = useToast();

  // Get current user ID
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.userId);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
    
    if (token) {
      getCurrentUser();
    }
  }, [token]);

  // Fetch auction details
  useEffect(() => {
    async function fetchAuctionDetails() {
      try {
        const res = await fetch(`${BASE_URL}/api/auction/${params.postId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Auction not found');
        }
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching auction:', error);
        showToast('Failed to load auction details', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (params.postId) {
      fetchAuctionDetails();
    }
  }, [params.postId]);



  const handleFavorite = async () => {
    if (!token) {
      showToast("Please login to favorite auctions", "error");
      return;
    }

    try {
      await dispatch(addFavorite({ postId: post!._id, token })).unwrap();
      setIsFavorite(true);
      showToast("Added to favorites!", "success");
    } catch (error) {
      showToast("Failed to add to favorites", "error");
    }
  };

  const getImageSrc = (image: string) => {
    if (!image) return undefined;
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = () => {
    if (!post) return 'text-gray-500';
    
    const isExpired = new Date(post.auctionEndTime) < new Date();
    switch (post.status) {
      case 'live':
        return isExpired ? 'text-red-500' : 'text-green-500';
      case 'sold':
        return 'text-blue-500';
      case 'expired':
        return 'text-red-500';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    if (!post) return 'Unknown';
    
    const isExpired = new Date(post.auctionEndTime) < new Date();
    switch (post.status) {
      case 'live':
        return isExpired ? 'Expired' : 'Live';
      case 'sold':
        return 'Sold';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Auction not found</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
                   </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image and Details */}
          <div className="space-y-6">
            {/* Images and Video Carousel */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {post.images && post.images.length > 0 ? (
                <div className="relative group">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                      clickable: true,
                      el: '.swiper-pagination',
                    }}
                    className="h-96"
                    loop={true}
                  >
                    {/* Video first if exists */}
                    {post.video && (
                      <SwiperSlide>
                        <video
                          src={`${BASE_URL}${post.video}`}
                          controls
                          className="w-full h-96 object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </SwiperSlide>
                    )}
                    
                    {/* Images */}
                    {post.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={getImageSrc(image)}
                          alt={`${post.title} - Image ${index + 1}`}
                          className="w-full h-96 object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  
                  {/* Navigation arrows - visible on hover */}
                  <div className="absolute inset-y-0 left-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button className="swiper-button-prev bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="absolute inset-y-0 right-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button className="swiper-button-next bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Pagination dots */}
                  <div className="swiper-pagination absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"></div>
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Images</span>
                </div>
              )}
            </div>

            {/* Auction Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{post.description}</p>

              {/* Auction Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Starting Price</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${post.startingPrice.toFixed(2)}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Duration</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{post.auctionDuration}h</div>
                </div>

                {post.buyNowPrice && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Buy Now Price</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">${post.buyNowPrice.toFixed(2)}</div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Seller</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{post.user.username}</div>
                </div>
              </div>

              {/* Created Date */}
              <div className="text-sm text-gray-500">
                Created on {formatDate(post.createdAt)}
              </div>
            </div>
          </div>

          {/* Right Column - Bidding Section */}
          <div className="space-y-6">
            <BiddingSection post={post} currentUserId={currentUserId} />
            
            {/* Seller Actions - Only show for auction owner */}
            {currentUserId === post.user._id && post.status === 'live' && (
              <SellerActions postId={post._id} currentPrice={post.currentPrice} />
            )}

            {/* Chat Section */}
            <ChatToggle postId={post._id} postTitle={post.title} />
          </div>
        </div>
      </div>
    </div>
  );
} 