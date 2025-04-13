import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  name,
  avatar,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isActive,
  onClick,
}) => {
  const formattedTime = formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      {avatar ? (
        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mr-3">
          <span className="text-lg font-semibold">{name.charAt(0).toUpperCase()}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>

        <div className="flex items-center">
          <p className="text-sm text-gray-500 truncate flex-1">{lastMessage || 'Start a conversation'}</p>

          {unreadCount > 0 && (
            <span className={`ml-2 flex-shrink-0 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
              unreadCount >= 50
                ? 'bg-red-600 text-white'
                : unreadCount >= 2
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
            }`}>
              {unreadCount >= 50 ? '50+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
