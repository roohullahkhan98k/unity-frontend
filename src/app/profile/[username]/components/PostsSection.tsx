"use client";
import { useEffect, useState, useRef } from "react";
import useAuthToken from "../../../hooks/useAuthToken";
import Modal from "../../../components/Modal";
import CreatePostModal from "../../../components/CreatePostModal";
import ConfirmationModal from "../../../components/ConfirmationModal";
import ReactivateModal from "../../../components/ReactivateModal";
import { useToast } from "../../../hooks/useToast";
import { Pencil, Trash2, Plus, Clock, DollarSign, X, RotateCcw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPosts, updatePost, deletePost, cancelPost, reactivatePost } from '../../../../store/postsSlice';
import type { RootState, AppDispatch } from '../../../../store/store';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Format time remaining
const formatTimeRemaining = (endTime: string) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export default function PostsSection() {
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [postToReactivate, setPostToReactivate] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const loading = useSelector((state: RootState) => state.posts.loading);
  const error = useSelector((state: RootState) => state.posts.error);
  const fetched = useSelector((state: RootState) => state.posts.fetched);
  const token = useAuthToken();

  useEffect(() => {
    async function fetchProfileAndPosts() {
      try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        dispatch(fetchUserPosts(data.userId));
      } catch {
        // silent error
      }
    }
    if (token) fetchProfileAndPosts();
  }, [token, dispatch]);

  function getImageSrc(image: string) {
    if (!image) return '/placeholder-image.png';
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  }

  // Format date function
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

  function handleEditClick(post: Post) {
    setEditPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditImagePreview(getImageSrc(post.images[0]) || null);
    setEditImage(null);
    setEditOpen(true);
  }

  function handleViewClick(post: Post) {
    setViewPost(post);
    setViewOpen(true);
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null;
    setEditImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") setEditImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(editPost ? getImageSrc(editPost.images[0]) || null : null);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPost) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDescription);
      if (editImage) formData.append("image", editImage);
      await dispatch(updatePost({ postId: editPost._id, formData, token })).unwrap();
      showToast("Auction updated successfully!", "success");
      setEditOpen(false);
      setEditPost(null);
      setEditImage(null);
      setEditImagePreview(null);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not update auction", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancelClick(post: Post) {
    try {
      await dispatch(cancelPost({ postId: post._id, token })).unwrap();
      showToast("Auction cancelled successfully!", "success");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not cancel auction", "error");
    }
  }

  function handleDeleteClick(post: Post) {
    setPostToDelete(post);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!postToDelete) return;
    
    try {
      await dispatch(deletePost({ postId: postToDelete._id, token })).unwrap();
      showToast("Auction deleted successfully!", "success");
      setPostToDelete(null);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not delete auction", "error");
    }
  }

  function handleReactivateClick(post: Post) {
    setPostToReactivate(post);
    setReactivateOpen(true);
  }

  async function handleReactivateConfirm(auctionDuration: number) {
    if (!postToReactivate) return;
    
    try {
      await dispatch(reactivatePost({ postId: postToReactivate._id, auctionDuration, token })).unwrap();
      showToast("Auction reactivated successfully!", "success");
      setPostToReactivate(null);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not reactivate auction", "error");
    }
  }

  const handleCreateSuccess = () => {
    // Refresh user posts after creating a new auction
    if (token) {
      dispatch(fetchUserPosts(posts[0]?.user?._id || ''));
    }
  };

  const getStatusColor = (post: Post) => {
    const isExpired = new Date(post.auctionEndTime) < new Date();
    switch (post.status) {
      case 'active':
        return isExpired ? 'text-red-500' : 'text-green-500';
      case 'ended':
        return 'text-blue-500';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (post: Post) => {
    const isExpired = new Date(post.auctionEndTime) < new Date();
    switch (post.status) {
      case 'active':
        return isExpired ? 'Expired' : 'Live';
      case 'ended':
        return 'Ended';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const isCancelled = (post: Post) => post.status === 'cancelled';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-gray-800">Your Auctions</div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Create Auction
        </button>
      </div>
      <div className="relative group">
        {showLoader || loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex items-center p-4">
                  {/* Avatar and Media skeleton */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
                  </div>

                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>

                  {/* Actions skeleton */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-16"></div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-8"></div>
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center py-3">Error: {error}</div>
        ) : !fetched ? (
          <div className="text-gray-400 italic text-center py-3">Loading auctions...</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-500 italic text-center py-3">(No auctions yet)</div>
        ) : (
          <div className="space-y-4 max-h-[calc(2*120px+2rem)] overflow-y-auto pr-2 custom-scrollbar group-hover:custom-scrollbar-visible">
            {posts.map(post => (
              <div 
                key={post._id} 
                className={`rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  isCancelled(post) 
                    ? 'bg-gray-50 opacity-75' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center p-4">
                  {/* Avatar and Media */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      isCancelled(post) 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    }`}>
                      <span className={`font-bold text-sm ${
                        isCancelled(post) ? 'text-gray-600' : 'text-white'
                      }`}>
                        {post.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      isCancelled(post) ? 'bg-gray-300' : 'bg-gray-200'
                    }`}>
                      {post.images[0] ? (
                        <Image
                          src={getImageSrc(post.images[0])}
                          alt={post.title}
                          width={80}
                          height={80}
                          className={`w-full h-full object-cover ${
                            isCancelled(post) ? 'grayscale opacity-50' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-lg truncate ${
                        isCancelled(post) ? 'text-gray-500' : 'text-gray-800'
                      }`}>
                        {post.title}
                      </h3>
                      <span className={`text-sm font-semibold ${getStatusColor(post)}`}>
                        {getStatusText(post)}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 mt-1 ${
                      isCancelled(post) ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {post.description}
                    </p>

                    {/* Auction Info */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className={`w-4 h-4 ${
                          isCancelled(post) ? 'text-gray-400' : 'text-green-600'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          isCancelled(post) ? 'text-gray-400' : 'text-green-600'
                        }`}>
                          ${post.currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${
                          isCancelled(post) ? 'text-gray-400' : 'text-orange-600'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          isCancelled(post) ? 'text-gray-400' : 'text-orange-600'
                        }`}>
                          {isCancelled(post) ? 'Cancelled' : formatTimeRemaining(post.auctionEndTime)}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs mt-2 font-medium ${
                      isCancelled(post) ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(post.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <button
                      onClick={() => handleViewClick(post)}
                      className={`font-semibold transition-all duration-200 cursor-pointer px-4 py-2 rounded-lg ${
                        isCancelled(post)
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                      }`}
                    >
                      View
                    </button>
                    
                    {/* Edit button - only for live auctions */}
                    {post.status === 'active' && (
                      <button
                        onClick={() => handleEditClick(post)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Edit Auction"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}

                    {/* Cancel button - only for live auctions */}
                    {post.status === 'active' && (
                      <button
                        onClick={() => handleCancelClick(post)}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Cancel Auction"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}

                    {/* Reactivate button - only for cancelled auctions */}
                    {post.status === 'cancelled' && (
                      <button
                        onClick={() => handleReactivateClick(post)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Reactivate Auction"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    )}

                    {/* Delete button - for all statuses */}
                    <button
                      onClick={() => handleDeleteClick(post)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                      title="Delete Auction"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Padding at the end for better scrolling */}
            <div className="pb-4"></div>
          </div>
        )}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.15);
            border-radius: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .custom-scrollbar-visible::-webkit-scrollbar-thumb {
            opacity: 1;
            background: rgba(99, 102, 241, 0.35);
          }
          .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.35);
            opacity: 1;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(99,102,241,0.15) transparent;
          }
          .custom-scrollbar-visible {
            scrollbar-color: rgba(99,102,241,0.35) transparent;
          }
          .group:hover .custom-scrollbar {
            scrollbar-color: rgba(99,102,241,0.35) transparent;
          }
        `}</style>
      </div>

      {/* View Modal */}
      <Modal open={viewOpen} onOpenChange={setViewOpen} title="View Auction">
        {viewPost && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">
                  {viewPost.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{viewPost.user?.username || 'Unknown User'}</h3>
                <p className="text-xs text-gray-500 font-medium">{formatDate(viewPost.createdAt)}</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900">{viewPost.title}</h2>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed text-sm">{viewPost.description}</p>

            {/* Auction Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-lg font-bold text-green-600">${viewPost.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Starting Price</p>
                <p className="text-lg font-bold text-gray-900">${viewPost.startingPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-lg font-bold text-orange-600">{formatTimeRemaining(viewPost.auctionEndTime)}</p>
              </div>
            </div>

            {/* Image */}
            {viewPost.images[0] && (
              <div className="mt-2">
                <Image
                  src={getImageSrc(viewPost.images[0])}
                  alt={viewPost.title}
                  width={400}
                  height={192}
                  className="w-full h-auto max-h-48 rounded-lg object-cover shadow-md"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onOpenChange={setEditOpen} title="Edit Auction">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          {editImagePreview && (
            <div className="flex justify-center mb-2">
              <Image src={editImagePreview} alt="Preview" width={160} height={160} className="h-40 w-auto rounded-lg shadow border border-indigo-200 object-contain" />
            </div>
          )}
          <input
            className="border rounded px-3 py-2"
            placeholder="Title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            required
          />
          <textarea
            className="border rounded px-3 py-2"
            placeholder="Description"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            required
            rows={3}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            className="border rounded px-3 py-2"
            placeholder="Buy Now Price (optional)"
            value=""
            onChange={() => {}}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleEditImageChange}
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition"
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Auction"}
          </button>
        </form>
      </Modal>

      {/* Create Auction Modal */}
      <CreatePostModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Auction"
        message={`Are you sure you want to permanently delete "${postToDelete?.title}"? This action cannot be undone and the auction will be completely removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Reactivate Modal */}
      <ReactivateModal
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        onConfirm={handleReactivateConfirm}
        postTitle={postToReactivate?.title || ''}
      />
    </div>
  );
}
