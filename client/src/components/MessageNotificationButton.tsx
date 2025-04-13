import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { MessageNotification } from './MessageNotification';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';

export const MessageNotificationButton: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch unread message count
  const { data } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    queryFn: async () => {
      const response = await apiRequest<{ count: number }>({
        url: '/api/messages/unread-count',
        method: 'GET',
      });
      return response.count;
    },
    enabled: !!isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = data || 0;

  const handleClick = () => {
    navigate({ to: '/messages' });
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      aria-label="Messages"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>

      <MessageNotification count={unreadCount} />
    </button>
  );
};
