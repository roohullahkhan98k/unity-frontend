"use client";
import { useEffect, useState, useRef } from "react";
import { UserCircle, Camera, Loader2 } from "lucide-react";
import SkeletonProfileCard from "../../../components/SkeletonProfileCard";
import * as Dialog from '@radix-ui/react-dialog';
import useAuthToken from "../../../hooks/useAuthToken";
import { useToast } from "../../../hooks/useToast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getImageSrc(profileImage: string | null | undefined) {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `${BASE_URL}${profileImage}`;
}

type Profile = {
  userId: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string | null;
  walletAddress?: string | null;
};

export default function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ username: "", email: "", bio: "", profileImage: null as File | null });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const token = useAuthToken();
  const showToast = useToast();


  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
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
        setProfile(data);
        setEditData({ 
          username: data.username || "", 
          email: data.email || "", 
          bio: data.bio || "", 
          profileImage: null 
        });
        setPreviewImage(getImageSrc(data.profileImage));
      } catch (err) {
        setError("Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "profileImage" && (e.target as HTMLInputElement).files) {
      const file = (e.target as HTMLInputElement).files![0];
      setEditData((prev) => ({ ...prev, profileImage: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (typeof ev.target?.result === "string") setPreviewImage(ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      formData.append("bio", editData.bio);
      if (editData.profileImage) formData.append("profileImage", editData.profileImage as Blob);
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PATCH",
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      setEditOpen(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast("Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonProfileCard />;
  return (
    <section className="col-span-1 bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
      {/* Removed in-component success/error messages */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-3 border-indigo-200 shadow"
            />
          ) : (
            <UserCircle className="w-16 h-16 text-indigo-400" />
          )}
          <button
            className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1 shadow hover:bg-indigo-600"
            onClick={() => setEditOpen(true)}
            aria-label="Edit profile picture"
            tabIndex={0}
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>
        <div className="text-lg font-bold text-gray-800">{profile?.username}</div>
        <div className="text-gray-500 mb-1 text-xs">{profile?.email}</div>
        <div className="text-center text-gray-600 mb-3 text-xs">{profile?.bio || "No bio yet."}</div>
      </div>
      
      <button
        className="mt-auto bg-indigo-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition text-sm w-full"
        onClick={() => setEditOpen(true)}
        aria-label="Edit profile"
        tabIndex={0}
      >Edit Profile</button>

      {/* Edit Profile Modal */}
      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">Edit Profile</Dialog.Title>
            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <div className="flex flex-col items-center gap-2">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200 shadow"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 text-indigo-400" />
                )}
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleEditChange}
                />
                <button
                  type="button"
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 text-sm"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  aria-label="Change profile photo"
                  tabIndex={0}
                >Change Photo</button>
              </div>
              <input
                className="border rounded px-3 py-2"
                name="username"
                value={editData.username || ""}
                onChange={handleEditChange}
                placeholder="Username"
                required
              />
              <input
                className="border rounded px-3 py-2"
                name="email"
                value={editData.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                required
                type="email"
              />
              <textarea
                className="border rounded px-3 py-2"
                name="bio"
                value={editData.bio || ""}
                onChange={handleEditChange}
                placeholder="Bio"
                rows={3}
                maxLength={200}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex-1 flex items-center justify-center"
                  disabled={saving}
                  aria-label="Save changes"
                  tabIndex={0}
                >{saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}{saving ? "Saving..." : "Save Changes"}</button>
                <Dialog.Close asChild>
                  <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex-1" aria-label="Cancel" tabIndex={0}>Cancel</button>
                </Dialog.Close>
              </div>
              {/* Removed in-component error message */}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
} 