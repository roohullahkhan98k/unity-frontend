"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Clock, DollarSign, Zap, MessageCircle } from "lucide-react";
import { useSelector } from 'react-redux';
import { useCountdown } from '../hooks/useCountdown';
import type { RootState } from '../../store/store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Post = {
  _id: string;
  user: { username: string; email: string; profileImage?: string };
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

interface PostCardProps {
  post: Post;
  showActions?: boolean;
}

export default function PostCard({ post, showActions = true }: PostCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  
  // Get updated post data from Redux store
  const { posts } = useSelector((state: RootState) => state.posts);
  const updatedPost = posts.find(p => p._id === post._id) || post;
  const currentPrice = updatedPost.currentPrice;

  // Use custom countdown hook
  const timeRemaining = useCountdown(post.auctionEndTime);

  const handleView = () => {
    router.push(`/auction/${post._id}`);
  };

  const totalSlides = (post.video ? 1 : 0) + (post.images?.length || 0);
  
  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getImageSrc = (image: string) => {
    if (!image) return undefined;
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  };

  const getStatusColor = () => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-[500px] mx-auto" onClick={handleView}>
      {/* Images and Video Carousel */}
      <div className="relative group">
        {post.images && post.images.length > 0 ? (
          <div className="relative h-64 overflow-hidden">
            {/* Simple carousel without external library for home page */}
            <div 
              className="flex transition-transform duration-300 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Video first if exists */}
              {post.video && (
                <div className="flex-shrink-0 w-full h-full">
                  <video
                    src={`${BASE_URL}${post.video}`}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                </div>
              )}
              
              {/* Images */}
              {post.images.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-full h-full">
                  <img
                    src={getImageSrc(image)}
                    alt={`${post.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Navigation arrows - visible on hover */}
            {((post.video && post.images.length > 0) || post.images.length > 1) && (
              <>
                <button 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                  onClick={prevSlide}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                  onClick={nextSlide}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Images</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-white shadow-sm ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Time Remaining Badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-white shadow-sm text-orange-600">
            <Clock className="w-3 h-3" />
            {timeRemaining}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">
              {post.user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{post.title}</h3>
            <p className="text-sm text-gray-500">{post.user?.username || 'Unknown User'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.description}</p>

        {/* Auction Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Current Price:</span>
            <span className="text-lg font-bold text-green-600">${currentPrice.toFixed(2)}</span>
          </div>
          
          {post.buyNowPrice && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Buy Now:</span>
              <span className="text-sm font-semibold text-blue-600">${post.buyNowPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleView();
                }}
                className="flex items-center gap-1 px-3 py-1 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 