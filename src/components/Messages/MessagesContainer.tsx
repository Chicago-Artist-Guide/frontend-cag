import React, { useState } from 'react';
import MessageThreadsActionBar from './MessageThreadsActionBar';
import MessageThreads from './MessageThreads';
import { MessageThread } from './MessageThread';
import { MessagesPagination } from './MessagesPagination';

const MessagesContainer: React.FC = () => {
  const [currentThread, setCurrentThread] = useState<string | null>(null);

  const handleThreadSelect = (roleId: string) => {
    setCurrentThread(roleId);
  };

  const handleBackToThreads = () => {
    setCurrentThread(null);
  };

  return (
    <div>
      <MessageThreadsActionBar />
      {currentThread ? (
        <>
          <a href="#" onClick={handleBackToThreads}>
            Back to All Messages
          </a>
          <MessageThread thread={currentThread} />
        </>
      ) : (
        <>
          <MessageThreads onThreadSelect={handleThreadSelect} />
          <MessagesPagination />
        </>
      )}
    </div>
  );
};

export default MessagesContainer;
