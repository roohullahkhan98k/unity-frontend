"use client";

export default function SkeletonPostCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-[500px] mx-auto">
      {/* Header skeleton */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
              <div className="h-2 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
      {/* Image skeleton */}
      <div className="h-80 bg-gray-300 animate-pulse"></div>
      {/* Actions skeleton */}
      <div className="p-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-5 bg-gray-300 rounded animate-pulse w-12"></div>
            <div className="h-5 bg-gray-300 rounded animate-pulse w-12"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </div>
  );
} 