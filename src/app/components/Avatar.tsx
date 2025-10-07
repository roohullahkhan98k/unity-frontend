"use client";
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface AvatarProps {
  src?: string | null;
  alt?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm', 
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl'
};

export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  username, 
  size = 'md', 
  className = '' 
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  
  if (src) {
    const imageSrc = src.startsWith("http") ? src : `${BASE_URL}${src}`;
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }
  
  return (
    <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
      <span className="text-gray-400 font-bold">
        {username?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  );
}
