import React from 'react';

interface MessageNotificationProps {
  count: number;
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({ count }) => {
  if (count === 0) {
    return null;
  }

  return (
    <span
      className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-medium text-white min-w-[18px] h-[18px] px-1 ${
        count >= 50
          ? 'bg-red-600'
          : count >= 2
            ? 'bg-yellow-500'
            : 'bg-red-500'
      }`}
      data-testid="message-notification"
    >
      {count >= 50 ? '50+' : count}
    </span>
  );
};
