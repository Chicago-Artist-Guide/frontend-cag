import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMessages } from '../../context/MessageContext';
import {
  getNameForAccount,
  getTheaterNameForAccount
} from '../Profile/shared/api';
import { getProduction } from '../Profile/Company/api';
import { Production, Role } from '../Profile/Company/types';
import { MessageThreadType } from './types';

interface MessageThreadProps {
  thread: MessageThreadType;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  const { threadId } = useParams();
  const { account } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const { loadThreadMessages, currentThreadMessages } = useMessages();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [production, setProduction] = useState<Production>();
  const [role, setRole] = useState<Role>();
  const [recipientName, setRecipientName] = useState<string | null>(null);

  const loadRecipientNameForThread = async (recipientId: string) => {
    const recipientName =
      account.data.type === 'company'
        ? await getNameForAccount(firebaseFirestore, recipientId)
        : await getTheaterNameForAccount(firebaseFirestore, recipientId);

    recipientName && setRecipientName(recipientName);
  };

  const loadProductionAndRoleForThread = async (
    productionId: string,
    roleId: string
  ) => {
    const productionData = await getProduction(firebaseFirestore, productionId);

    if (productionData) {
      setProduction(productionData);

      const findRole = productionData.roles?.find((r) => r.role_id === roleId);
      findRole && setRole(findRole);
    }
  };

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
    const productionId =
      typeof thread.production_id === 'string'
        ? thread.production_id
        : thread.production_id?.id;

    loadThreadMessages(senderId, recipientId, threadId);
    setAccountId(accountIdStr);
    loadRecipientNameForThread(recipientId);
    productionId &&
      thread.role_id &&
      loadProductionAndRoleForThread(productionId, thread.role_id);
    setLoading(false);
  }, [account, thread, threadId]);

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3 className="m-0 text-xl font-semibold">
            Thread with {recipientName}
          </h3>
          <h4 className="m-0 mb-4">
            {role?.role_name} for {production?.production_name}
          </h4>
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
                        : 'text-gray-800 bg-lighterGrey'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
