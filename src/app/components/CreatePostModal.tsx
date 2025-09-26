"use client";
import { useState, useRef } from "react";
import Modal from "./Modal";
import { useToast } from "../hooks/useToast";
import useAuthToken from "../hooks/useAuthToken";
import { useDispatch } from 'react-redux';
import { createPost, fetchAllPosts } from "../../store/postsSlice";
import type { AppDispatch } from "../../store/store";
import Image from 'next/image';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreatePostModal({ open, onOpenChange, onSuccess }: CreatePostModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("24"); // Default 24 hours
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const showToast = useToast();
  const token = useAuthToken();
  const dispatch = useDispatch<AppDispatch>();

  const handleAddPost = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (images.length === 0 || !title || !description || !startingPrice || !auctionDuration) {
      showToast("At least one image, title, description, starting price, and auction duration are required", "error");
      return;
    }

    // Validate starting price
    if (parseFloat(startingPrice) <= 0) {
      showToast("Starting price must be greater than 0", "error");
      return;
    }

    // Validate auction duration
    if (parseFloat(auctionDuration) <= 0) {
      showToast("Auction duration must be greater than 0", "error");
      return;
    }

    // Validate buy now price if provided
    if (buyNowPrice && parseFloat(buyNowPrice) <= parseFloat(startingPrice)) {
      showToast("Buy now price must be higher than starting price", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      // Append all images
      images.forEach((image) => {
        formData.append("images", image);
      });
      
      // Append video if exists
      if (video) {
        formData.append("video", video);
      }
      
      formData.append("startingPrice", startingPrice);
      formData.append("auctionDuration", auctionDuration);
      if (buyNowPrice) {
        formData.append("buyNowPrice", buyNowPrice);
      }

      await dispatch(createPost({ formData, token })).unwrap();
      dispatch(fetchAllPosts());
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartingPrice("");
      setAuctionDuration("24");
      setBuyNowPrice("");
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoPreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      
      showToast("Auction post created successfully!", "success");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Could not create auction post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages(prev => [...prev, ...newImages]);
      
              // Create previews for new images
        newImages.forEach(file => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const target = ev.target;
            if (target && typeof target.result === "string") {
              setImagePreviews(prev => [...prev, target.result as string]);
            }
          };
          reader.readAsDataURL(file);
        });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setVideo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") setVideoPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setVideoPreview(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Create Auction Post" size="large">
      <form onSubmit={handleAddPost} className="flex flex-col gap-3 w-full">
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <Image 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  width={80}
                  height={80}
                  className="h-20 w-full rounded-lg shadow border border-indigo-200 object-cover" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="relative mb-3">
            <video 
              src={videoPreview} 
              controls 
              className="h-32 w-full rounded-lg shadow border border-indigo-200 object-cover" 
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Image Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Images (Required - Select multiple)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={handleImageChange}
            className="border rounded px-3 py-2 text-sm w-full"
            required={images.length === 0}
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Video (Optional)
          </label>
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={handleVideoChange}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        
        <textarea
          className="border rounded px-3 py-2 text-sm"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          rows={2}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Starting Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="0.00"
              value={startingPrice}
              onChange={e => setStartingPrice(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <select
              className="border rounded px-3 py-2 text-sm w-full"
              value={auctionDuration}
              onChange={e => setAuctionDuration(e.target.value)}
              required
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Buy Now Price ($) - Optional
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="border rounded px-3 py-2 text-sm w-full"
            placeholder="Leave empty for auction only"
            value={buyNowPrice}
            onChange={e => setBuyNowPrice(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            If set, users can buy immediately at this price
          </p>
        </div>

        <button
          type="submit"
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition text-sm"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Auction"}
        </button>
      </form>
    </Modal>
  );
} 