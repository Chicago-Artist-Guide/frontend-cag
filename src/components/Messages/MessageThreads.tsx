import React, { useEffect, useState } from 'react';
import {
  getNameForAccount,
  getTheaterNameForAccount
} from '../Profile/shared/api';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMessages } from '../../context/MessageContext';
import { getProfileWithUid } from '../Matches/api';
import { MessageThreadType } from './types';
import { defaultPfp } from '../../images';

interface MessageThreadsProps {
  onThreadSelect: (threadId: string) => void;
}

type MessageThreadTypeExtended = MessageThreadType & {
  threadPreviewImg: string;
  recipientName: string;
  statusNew: boolean;
};

const MessageThreads: React.FC<MessageThreadsProps> = ({ onThreadSelect }) => {
  const { account } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const { threads, loadThreads, currentThread } = useMessages();
  const [loading, setLoading] = useState(true);
  const [threadData, setThreadData] = useState<MessageThreadTypeExtended[]>([]);

  useEffect(() => {
    const loadThreadsAsync = async () => {
      const accountId = account?.data?.uid;
      await loadThreads(accountId);
    };

    loadThreadsAsync();
  }, [account]);

  useEffect(() => {
    const fetchThreadsData = async () => {
      const data = await Promise.all(
        threads.map(async (thread) => {
          const whichStatus =
            account.data.type === 'company'
              ? thread.theater_status
              : thread.talent_status;
          const statusNew = whichStatus === 'new';
          const recipientIdRef =
            account.data.type === 'company'
              ? thread.talent_account_id
              : thread.theater_account_id;
          const recipientId =
            typeof recipientIdRef === 'string'
              ? recipientIdRef
              : recipientIdRef.id;
          const getRecipientProfile = await getProfileWithUid(
            firebaseFirestore,
            recipientId
          );
          const threadPreviewImg =
            getRecipientProfile && getRecipientProfile?.profile_image_url
              ? getRecipientProfile?.profile_image_url
              : defaultPfp;
          const recipientName =
            account.data.type === 'company'
              ? await getNameForAccount(firebaseFirestore, recipientId)
              : await getTheaterNameForAccount(firebaseFirestore, recipientId);

          return {
            ...thread,
            threadPreviewImg,
            recipientName,
            statusNew
          };
        })
      );

      setThreadData(data);
      setLoading(false);
    };

    fetchThreadsData();
  }, [account, threads]);

  return (
    <div className="p-4">
      <h4 className="mb-4 text-lg font-semibold">Threads</h4>
      {loading ? (
        <p>Loading threads...</p>
      ) : (
        <div className="space-y-4">
          {threadData && threadData.length ? (
            threadData.map((thread, i) => (
              <div
                key={`${thread.id}-${i}`}
                onClick={() => onThreadSelect(thread.id)}
                className={`flex cursor-pointer items-center rounded-lg border-b border-stone-200 p-2 ${
                  currentThread?.id === thread.id
                    ? 'bg-blue-100'
                    : thread.statusNew
                      ? 'bg-gray-100'
                      : 'bg-white'
                } hover:bg-gray-200`}
              >
                <img
                  src={thread.threadPreviewImg}
                  alt="Preview"
                  className="mr-3 h-10 w-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold">{thread.recipientName}</p>
                  <p className="text-gray-600 line-clamp-1 text-sm">
                    {thread.last_message.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No threads available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageThreads;
