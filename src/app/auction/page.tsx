"use client";

import Link from 'next/link';
import { useState } from 'react';

const mockAuctions = [
  { id: 1, item: 'NFT #123', highest: 2.5, currency: 'ETH' },
  { id: 2, item: 'NFT #456', highest: 1500, currency: 'USDT' },
];

export default function Auction() {
  const [active, setActive] = useState<number|null>(null);
  const [bid, setBid] = useState('');
  const [proxy, setProxy] = useState('');
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Link href="/home" className="mb-4 inline-block text-blue-600 hover:underline">← Back to Feed</Link>
      <div className="flex gap-8">
        <aside className="w-64 bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">Auctions</h2>
          <ul>
            {mockAuctions.map(a => (
              <li key={a.id} className={`p-2 rounded cursor-pointer ${active===a.id?'bg-blue-100':''}`} onClick={()=>setActive(a.id)}>
                <div className="font-semibold">{a.item}</div>
                <div className="text-xs text-gray-500">Highest: {a.highest} {a.currency}</div>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex-1 bg-white rounded-lg shadow p-4">
          {active ? (
            <div>
              <div className="font-bold mb-2">{mockAuctions.find(a=>a.id===active)?.item}</div>
              <div className="mb-2">Highest Bid: {mockAuctions.find(a=>a.id===active)?.highest} {mockAuctions.find(a=>a.id===active)?.currency}</div>
              <form className="space-y-2">
                <input value={bid} onChange={e=>setBid(e.target.value)} className="w-full border rounded p-2" placeholder="Your bid amount" />
                <input value={proxy} onChange={e=>setProxy(e.target.value)} className="w-full border rounded p-2" placeholder="Proxy bid (optional)" />
                <button type="button" className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">Place Bid</button>
              </form>
              <div className="text-xs text-gray-500 mt-2">Proxy bidding lets you set a max bid. The system will auto-bid for you up to that amount.</div>
            </div>
          ) : (
            <div className="text-gray-500">Select an auction</div>
          )}
        </section>
      </div>
    </main>
  );
} 