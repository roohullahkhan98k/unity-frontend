"use client";
import Link from 'next/link';
import { useState } from 'react';

const mockConversations = [
  { id: 1, user: 'Alice', last: 'Hey there!' },
  { id: 2, user: 'Bob', last: 'How are you?' },
];

export default function Chat() {
  const [active, setActive] = useState<number|null>(null);
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Link href="/home" className="mb-4 inline-block text-blue-600 hover:underline">← Back to Feed</Link>
      <div className="flex gap-8">
        <aside className="w-64 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">Conversations</h2>
          <ul>
            {mockConversations.map(conv => (
              <li key={conv.id} className={`p-2 rounded cursor-pointer ${active===conv.id?'bg-blue-100':''}`} onClick={()=>setActive(conv.id)}>
                <div className="font-semibold">{conv.user}</div>
                <div className="text-xs text-gray-500">{conv.last}</div>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex-1 bg-white rounded-lg shadow p-4">
          {active ? (
            <div>
              <div className="font-bold mb-2">Chat with {mockConversations.find(c=>c.id===active)?.user}</div>
              <div className="h-64 bg-gray-100 rounded mb-2 p-2 overflow-y-auto">(Messages...)</div>
              <input className="w-full border rounded p-2" placeholder="Type a message..." />
            </div>
          ) : (
            <div className="text-gray-500">Select a conversation</div>
          )}
        </section>
      </div>
    </main>
  );
} 