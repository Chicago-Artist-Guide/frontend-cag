import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../context/MessageContext';
import { MessageThread } from './MessageThread';
import MessageThreads from './MessageThreads';
import { MessageThreadType } from './types';

const MessagesContainer: React.FC = () => {
  const navigate = useNavigate();
  const { currentThread: currThreadFromContext } = useMessages();
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );

  const handleThreadSelect = (threadId: string) => {
    navigate(`/profile/messages/${threadId}`);
  };

  useEffect(() => {
    setCurrentThread(currThreadFromContext);
  }, [currThreadFromContext]);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-stone-200 pr-2">
        <MessageThreads onThreadSelect={handleThreadSelect} />
      </div>
      <div className="w-2/3 p-4">
        {currentThread ? (
          <MessageThread thread={currentThread} />
        ) : (
          <p className="text-gray-500">Please select a thread.</p>
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;
