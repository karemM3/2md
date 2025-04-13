import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { ConversationItem } from '../../components/ConversationItem';
import { MessagingHeader } from '../../components/MessagingHeader';
import { MessageItem } from '../../components/MessageItem';
import { MessageInput } from '../../components/MessageInput';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';

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

export default function MessagesPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the recipient ID from URL query parameters if provided
  const urlParams = new URLSearchParams(location.search);
  const recipientId = urlParams.get('recipientId');

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const response = await apiRequest<Conversation[]>({
        url: '/api/conversations',
        method: 'GET',
      });
      return response;
    },
    enabled: !!userId,
  });

  // Create or get a conversation with a specific user
  const createConversationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await apiRequest<Conversation>({
        url: '/api/conversations',
        method: 'POST',
        data: { recipientId },
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations'],
      });
      setSelectedConversation(data);
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/conversations', selectedConversation?.id, 'messages'],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];

      const response = await apiRequest<Message[]>({
        url: `/api/conversations/${selectedConversation.id}/messages`,
        method: 'GET',
      });

      return response;
    },
    enabled: !!selectedConversation?.id,
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
      if (!selectedConversation?.id) throw new Error('No conversation selected');

      const formData = new FormData();
      formData.append('content', content);

      files.forEach((file) => {
        formData.append('files', file);
      });

      // Use fetch directly for FormData
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
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
        queryKey: ['/api/conversations', selectedConversation?.id, 'messages'],
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

  // Effect to create/select conversation if recipientId is provided in URL
  useEffect(() => {
    if (recipientId && userId) {
      // Find if conversation already exists with this recipient
      const existingConversation = conversations.find(
        (conv) => conv.otherUser?.id === recipientId
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create a new conversation with this recipient
        createConversationMutation.mutate(recipientId);
      }

      // Remove the recipientId from URL after handling
      navigate({
        to: '/messages',
        search: {},
        replace: true,
      });
    }
  }, [recipientId, userId, conversations]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden flex h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>

            <div className="overflow-y-auto h-[calc(100%-64px)]">
              {isLoadingConversations ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-gray-500 mb-2">No conversations yet</p>
                  <p className="text-sm text-gray-400">
                    Start messaging by contacting a service provider or employer
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    id={conversation.id}
                    name={conversation.otherUser?.name || 'Unknown User'}
                    avatar={conversation.otherUser?.avatar}
                    lastMessage={conversation.lastMessage}
                    lastMessageTime={conversation.lastMessageDate}
                    unreadCount={conversation.unreadCount}
                    isActive={selectedConversation?.id === conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <MessagingHeader
                  title={selectedConversation.otherUser?.name || 'Unknown User'}
                  avatar={selectedConversation.otherUser?.avatar}
                  onBack={() => setSelectedConversation(null)}
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-2">Select a conversation</p>
                <p className="text-sm text-gray-400">
                  Or start a new one by contacting a user
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
