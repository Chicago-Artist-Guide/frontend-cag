import React, { useEffect } from 'react';
import { useProfileContext } from '../../context/ProfileContext';
import { useMessages } from '../../context/MessageContext';
import { MessageType } from './types';

// TODO: add "read" and "unread" state for thread grouped messages

interface MessageThreadsProps {
  onThreadSelect: (roleId: string) => void;
}

const MessageThreads: React.FC<MessageThreadsProps> = ({ onThreadSelect }) => {
  const { account } = useProfileContext();
  const { threads, loadThreads } = useMessages();

  useEffect(() => {
    const accountId = account?.data?.id;
    loadThreads(accountId);
  }, [loadThreads]);

  return (
    <div>
      {threads.map((thread, i) => (
        <div
          key={`${thread.role_id}-i`}
          onClick={() => onThreadSelect(thread.role_id)}
        >
          <h4>Role: {thread.role_id}</h4>
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
