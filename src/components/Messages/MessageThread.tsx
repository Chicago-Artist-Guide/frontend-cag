import React from 'react';

interface MessageThreadProps {
  thread: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  // TODO: use context to get thread

  return (
    <div>
      <p>Individual message thread for {thread}</p>
    </div>
  );
};
