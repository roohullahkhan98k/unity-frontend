"use client";
import { Heart } from 'lucide-react';
import PostCard from './PostCard';
import SkeletonPostCard from './SkeletonPostCard';
import EmptyState from './EmptyState';

type Post = {
  _id: string;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  auctionEndTime: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  images: string[];
  video?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended' | 'cancelled';
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
  layout = 'list'
}: PostsGridProps) {


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