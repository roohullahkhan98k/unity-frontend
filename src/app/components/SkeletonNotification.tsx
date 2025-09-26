"use client";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonNotification() {
  return (
    <div className="flex gap-3 p-3">
      <Skeleton circle height={36} width={36} />
      <div className="flex-1">
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="60%" className="mt-1" />
      </div>
    </div>
  );
} 