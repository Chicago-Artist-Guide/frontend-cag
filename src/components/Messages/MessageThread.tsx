import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageThreadType } from './types';

interface MessageThreadProps {
  thread: MessageThreadType;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  const { threadId } = useParams();

  console.log(thread);

  return (
    <div>
      <p>Thread {threadId}</p>
    </div>
  );
};
