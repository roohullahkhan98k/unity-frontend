import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  className?: string;
}

export default function PageLayout({ 
  children, 
  title, 
  maxWidth = '4xl',
  className = ''
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto py-8 px-4 ${className}`}>
      {title && (
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{title}</h1>
      )}
      {children}
    </div>
  );
} 