import React, { useState, useEffect } from 'react';
import { useMessages } from '../../context/MessageContext';
import { MessageThread } from './MessageThread';
import MessageThreads from './MessageThreads';
import MessageThreadsActionBar from './MessageThreadsActionBar';
import { MessageThreadType } from './types';

const MessagesContainer: React.FC = () => {
  const { currentThread: currThreadFromContext } = useMessages();
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );

  const handleThreadSelect = (threadId: string) => {
    // setCurrentThread(threadId);
  };

  const handleBackToThreads = () => {
    setCurrentThread(null);
  };

  useEffect(() => {
    setCurrentThread(currThreadFromContext);
  }, [currThreadFromContext]);

  return (
    <div>
      <MessageThreadsActionBar />
      <MessageThreads onThreadSelect={handleThreadSelect} />
      {currentThread ? (
        <>
          <a href="#" onClick={handleBackToThreads}>
            Back to All Messages
          </a>
          <MessageThread thread={currentThread} />
        </>
      ) : (
        <p>Please select a thread.</p>
      )}
    </div>
  );
};

export default MessagesContainer;
