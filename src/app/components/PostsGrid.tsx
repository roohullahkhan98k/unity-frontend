"use client";
import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import PostCard from './PostCard';
import SkeletonPostCard from './SkeletonPostCard';
import EmptyState from './EmptyState';
import { useThrottle } from '../hooks/useThrottle';
import { useDispatch } from 'react-redux';
import { addFavorite } from '../../store/favoritesSlice';
import { useToast } from '../hooks/useToast';
import useAuthToken from '../hooks/useAuthToken';
import type { RootState, AppDispatch } from '../../store/store';

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

interface PostsGridProps {
  posts: Post[];
  loading: boolean;
  title?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  showFavoriteButton?: boolean;
  layout?: 'grid' | 'list';
}

export default function PostsGrid({ 
  posts, 
  loading, 
  title,
  emptyMessage = "No posts found.",
  emptyDescription,
  showFavoriteButton = true,
  layout = 'list'
}: PostsGridProps) {
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const showToast = useToast();

  const throttledAddFavorite = useThrottle((postId: string, postTitle: string) => {
    dispatch(addFavorite({ postId, token })).unwrap().then(()=>{
      showToast(`Favorited ${postTitle}`, 'success');
    }).catch(()=> showToast('Could not favorite', 'error'));
  }, 1000);

  const handleFavorite = (post: Post) => {
    throttledAddFavorite(post._id, post.title);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPostCard key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      {title && (
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{title}</h1>
      )}
      
      <div className={layout === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-6"}>
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            showActions={true}
          />
        ))}
      </div>
    </>
  );
} 