"use client";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonProfileCard() {
  return (
    <section className="col-span-1 bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col items-center">
      <div className="mb-4">
        <Skeleton circle height={96} width={96} />
      </div>
      <Skeleton height={24} width={140} className="mb-2" />
      <Skeleton height={16} width={180} className="mb-4" />
      <Skeleton height={14} width={220} count={2} />
      <Skeleton height={36} width={120} className="mt-4" />
    </section>
  );
} 