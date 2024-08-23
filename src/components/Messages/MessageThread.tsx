import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../../context/MessageContext';
import { MessageThreadType } from './types';

interface MessageThreadProps {
  thread: MessageThreadType;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  const { threadId } = useParams();
  const { loadThreadMessages, currentThreadMessages } = useMessages();

  // TODO: make sure we're checking account type before deciding if theater or talent id
  useEffect(() => {
    const theaterId =
      typeof thread.theater_account_id === 'string'
        ? thread.theater_account_id
        : thread.theater_account_id.id;
    const talentId =
      typeof thread.talent_account_id === 'string'
        ? thread.talent_account_id
        : thread.talent_account_id.id;
    loadThreadMessages(theaterId, talentId);
  }, []);

  return (
    <div>
      <h3>Thread {threadId}</h3>
      {currentThreadMessages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
};
