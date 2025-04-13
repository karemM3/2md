import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  content: string;
  isOwn: boolean;
  timestamp: Date;
  attachments?: string[];
  isRead?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  content,
  isOwn,
  timestamp,
  attachments = [],
  isRead,
}) => {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  const renderAttachment = (url: string) => {
    const fileExtension = url.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');

    if (isImage) {
      return (
        <div className="mt-2 max-w-[200px] rounded-md overflow-hidden">
          <img src={url} alt="Attachment" className="w-full h-auto object-cover" />
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 p-2 bg-gray-100 rounded-md text-blue-600 hover:text-blue-800 truncate"
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{url.split('/').pop()}</span>
        </div>
      </a>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
        isOwn
          ? 'bg-primary text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-800 rounded-tl-none'
      }`}>
        {content && <p className="break-words">{content}</p>}

        {attachments.map((url, index) => (
          <div key={index}>{renderAttachment(url)}</div>
        ))}

        <div className={`text-xs mt-1 flex items-center ${isOwn ? 'text-gray-200' : 'text-gray-500'}`}>
          <span>{formattedTime}</span>

          {isOwn && (
            <span className="ml-2">
              {isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
