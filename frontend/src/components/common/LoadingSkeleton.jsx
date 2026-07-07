/**
 * LoadingSkeleton.jsx - Loading skeleton for UX improvements
 */
import React from 'react';

const LoadingSkeleton = ({ count = 1, type = 'card', className = '' }) => {
  const baseStyle = 'bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse';

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`rounded-lg p-6 ${baseStyle} h-32`} />
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseStyle} h-4 rounded`} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className={`${baseStyle} h-12 rounded flex-1`} />
            <div className={`${baseStyle} h-12 rounded flex-1`} />
            <div className={`${baseStyle} h-12 rounded flex-1`} />
          </div>
        ))}
      </div>
    );
  }

  return <div className={`${baseStyle} h-12 rounded ${className}`} />;
};

export default LoadingSkeleton;
