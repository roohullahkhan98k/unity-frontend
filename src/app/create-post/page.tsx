"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function CreatePost() {
  const [aiScan, setAiScan] = useState(false);
  const [posted, setPosted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAiScan(true);
    setTimeout(() => {
      setAiScan(false);
      setPosted(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
      <Link href="/home" className="mb-4 text-blue-600 hover:underline">← Back to Feed</Link>
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        {posted ? (
          <div className="text-green-600 font-semibold">Post created! (AI scan passed)</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea className="w-full border rounded p-2" placeholder="What's on your mind?" required />
            <input type="file" className="w-full" accept="image/*,video/*" />
            <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700" disabled={aiScan}>
              {aiScan ? 'Scanning with AI...' : 'Post'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
} 