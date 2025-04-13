import React from 'react';

interface MessagingHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  onBack?: () => void;
}

export const MessagingHeader: React.FC<MessagingHeaderProps> = ({
  title,
  subtitle,
  avatar,
  onBack,
}) => {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 bg-white">
      {onBack && (
        <button
          onClick={onBack}
          className="mr-3 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {avatar ? (
        <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
          <img src={avatar} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3">
          <span className="text-lg font-semibold">{title.charAt(0).toUpperCase()}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
