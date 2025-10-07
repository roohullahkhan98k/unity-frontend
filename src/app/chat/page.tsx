"use client";
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Chat() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Link href="/home" className="mb-4 inline-block text-blue-600 hover:underline">← Back to Feed</Link>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Available</h2>
          <p className="text-gray-500 text-sm mt-2">Please check back later!</p>
        </div>
      </div>
    </main>
  );
} 