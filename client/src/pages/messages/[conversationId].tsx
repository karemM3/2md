import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessagingHeader } from '../../components/MessagingHeader';
import { MessageItem } from '../../components/MessageItem';
import { MessageInput } from '../../components/MessageInput';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function ConversationDetailPage() {
  const { conversationId } = useParams({ from: '/messages/:conversationId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch conversation details
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/conversations', conversationId],
    queryFn: async () => {
      const conversations = await apiRequest<Conversation[]>({
        url: '/api/conversations',
        method: 'GET',
      });

      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    },
    enabled: !!conversationId && !!userId,
  });

  // Fetch messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    queryFn: async () => {
      const response = await apiRequest<Message[]>({
        url: `/api/conversations/${conversationId}/messages`,
        method: 'GET',
      });

      return response;
    },
    enabled: !!conversationId && !!userId,
    onSuccess: () => {
      // After fetching messages, invalidate the conversations query to update unread counts
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations'],
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('content', content);

      files.forEach((file) => {
        formData.append('files', file);
      });

      // Use fetch directly for FormData
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations', conversationId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations'],
      });
    },
  });

  // Handle sending a message
  const handleSendMessage = (content: string, files: File[]) => {
    sendMessageMutation.mutate({ content, files });
  };

  // Handle back button
  const handleBack = () => {
    navigate({ to: '/messages' });
  };

  if (isLoadingConversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-gray-700 mb-4">Conversation not found</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-100px)]">
          <MessagingHeader
            title={conversation.otherUser?.name || 'Unknown User'}
            avatar={conversation.otherUser?.avatar}
            onBack={handleBack}
          />

          <div className="flex-1 p-4 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  content={message.content}
                  isOwn={message.senderId === userId}
                  timestamp={message.createdAt}
                  attachments={message.attachments}
                  isRead={message.isRead}
                />
              ))
            )}
          </div>

          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
