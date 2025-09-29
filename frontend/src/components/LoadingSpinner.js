import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block relative">
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin`}></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 font-medium">{message}</p>
        <div className="mt-2">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;