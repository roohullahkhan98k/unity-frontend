"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import CreatePostModal from "../components/CreatePostModal";
import PostsGrid from "../components/PostsGrid";
import PageLayout from "../components/PageLayout";
import useAuthToken from "../hooks/useAuthToken";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts } from "../../store/postsSlice";
import { getFavorites } from "../../store/favoritesSlice";
import type { RootState, AppDispatch } from "../../store/store";

export default function Home() {
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false);
  const [initialSkeleton, setInitialSkeleton] = useState(true);

  const token = useAuthToken();
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const postsLoading = useSelector((state: RootState) => state.posts.loading);

  // ensure skeleton visible at least 2s
  useEffect(() => {
    const t = setTimeout(() => setInitialSkeleton(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    // Always fetch all posts when home page loads
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    // Fetch favorites when token is available
    if (token) {
      dispatch(getFavorites(token));
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageLayout>
        <PostsGrid
          posts={posts}
          loading={postsLoading || initialSkeleton}
          showFavoriteButton={true}
          layout="list"
        />
      </PageLayout>

      {/* Create Post Modal */}
      <CreatePostModal 
        open={open} 
        onOpenChange={setOpen}
      />
      
      {/* Floating create post button */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        onClick={() => setOpen(true)}
        aria-label="Create Post"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
