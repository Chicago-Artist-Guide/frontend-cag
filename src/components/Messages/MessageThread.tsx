import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { useMessages } from '../../context/MessageContext';
import { MessageThreadType, MessageType } from './types';

interface MessageThreadProps {
  thread: MessageThreadType;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  const { threadId } = useParams();
  const { account } = useUserContext();
  const { loadThreadMessages, currentThreadMessages } = useMessages();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const accountIdStr = account?.data?.uid || null;
    const accountType = account?.data?.type || null;

    if (!accountIdStr || !accountType) {
      return;
    }

    const theaterId =
      typeof thread.theater_account_id === 'string'
        ? thread.theater_account_id
        : thread.theater_account_id.id;
    const talentId =
      typeof thread.talent_account_id === 'string'
        ? thread.talent_account_id
        : thread.talent_account_id.id;
    const senderId = accountType === 'company' ? theaterId : talentId;
    const recipientId = accountType === 'company' ? talentId : theaterId;

    loadThreadMessages(senderId, recipientId, threadId);
    setAccountId(accountIdStr);
  }, [account, threadId]);

  return (
    <div className="p-4">
      <h3 className="mb-4 text-xl font-semibold">Thread {threadId}</h3>
      <div className="space-y-4">
        {currentThreadMessages.map((msg) => {
          const senderIdStr =
            typeof msg.sender_id === 'string'
              ? msg.sender_id
              : msg.sender_id.id;
          const isSender = senderIdStr === accountId;

          return (
            <div
              key={msg.id}
              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  isSender
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
