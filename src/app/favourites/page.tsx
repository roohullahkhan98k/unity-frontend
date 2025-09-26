"use client";
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostsGrid from "../components/PostsGrid";
import PageLayout from "../components/PageLayout";
import { getFavorites } from "../../store/favoritesSlice";
import { fetchAllPosts } from "../../store/postsSlice";
import useAuthToken from "../hooks/useAuthToken";
import type { RootState, AppDispatch } from "../../store/store";

export default function FavouritesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const favIds = useSelector((s: RootState) => s.favorites.favorites);
  const favoritesLoading = useSelector((s: RootState) => s.favorites.loading);
  const allPosts = useSelector((s: RootState) => s.posts.posts);
  const postsLoading = useSelector((s: RootState) => s.posts.loading);

  useEffect(() => {
    // Always fetch favorites every time page is visited
    if (token) {
      dispatch(getFavorites(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Always fetch posts every time page is visited
    dispatch(fetchAllPosts());
  }, [dispatch]);

  const favPosts = allPosts.filter(p => favIds.includes(p._id));
  const isLoading = postsLoading || favoritesLoading;

  return (
    <PageLayout title="Your Favourites">
      <PostsGrid
        posts={favPosts}
        loading={isLoading}
        emptyMessage="No favourites yet"
        emptyDescription="Start exploring posts and add them to your favourites to see them here."
        showFavoriteButton={true}
        layout="list"
      />
    </PageLayout>
  );
} 