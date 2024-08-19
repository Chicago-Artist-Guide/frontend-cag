import React, { useEffect } from 'react';
import { useMessages } from '../../context/MessageContext';
import { useUserContext } from '../../context/UserContext';
import { MessageType } from './types';

// TODO: add "read" and "unread" state for thread grouped messages

interface MessageThreadsProps {
  onThreadSelect: (roleId: string) => void;
}

const MessageThreads: React.FC<MessageThreadsProps> = ({ onThreadSelect }) => {
  const { account } = useUserContext();
  const { threads, loadThreads } = useMessages();

  useEffect(() => {
    const accountId = account?.data?.id;
    loadThreads(accountId);
  }, [loadThreads]);

  return (
    <div>
      {threads.map((thread, i) => (
        <div
          key={`${thread.id}-${i}`}
          onClick={() => onThreadSelect(thread.id)}
        >
          <h4>Role: {thread.id}</h4>
          {thread.messages.slice(0, 1).map((message: MessageType) => (
            <div key={message.id}>
              <p>{message.message}</p> {/* TODO: design as a message preview */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageThreads;
