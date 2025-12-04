import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessages } from '../../context/MessageContext';
import { MessageThread } from './MessageThread';
import MessageThreads from './MessageThreads';
import { MessageThreadType } from './types';

const MessagesContainer: React.FC = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { currentThread: currThreadFromContext } = useMessages();
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );

  const handleThreadSelect = (threadId: string) => {
    navigate(`/profile/messages/${threadId}`);
  };

  const handleBackToList = () => {
    navigate('/profile/messages');
  };

  useEffect(() => {
    setCurrentThread(currThreadFromContext);
  }, [currThreadFromContext]);

  // On mobile, show thread list or thread view, not both
  // On desktop, show both side by side
  const showThreadList = !threadId || !currentThread;
  const showThreadView = threadId && currentThread;

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col lg:h-screen lg:flex-row">
      {/* Thread List - Hidden on mobile when viewing a thread */}
      <div
        className={`${
          showThreadList ? 'flex' : 'hidden'
        } w-full flex-col border-r-0 border-stone-200 pr-0 lg:flex lg:w-1/3 lg:border-r lg:pr-2`}
      >
        <MessageThreads onThreadSelect={handleThreadSelect} />
      </div>
      {/* Thread View - Hidden on mobile when no thread selected */}
      <div
        className={`${
          showThreadView ? 'flex' : 'hidden'
        } w-full flex-col lg:flex lg:w-2/3`}
      >
        {currentThread ? (
          <MessageThread thread={currentThread} onBack={handleBackToList} />
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-gray-500">Please select a thread.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;
