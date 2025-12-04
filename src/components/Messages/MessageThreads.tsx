import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMessages } from '../../context/MessageContext';
import {
  getNameForAccount,
  getProfileWithUid,
  getTheaterNameForAccount
} from '../Profile/shared/api';
import { getProduction } from '../Profile/Company/api';
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
  const { threadId } = useParams();
  const { account } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const { threads, loadThreads } = useMessages();
  const [loading, setLoading] = useState(true);
  const [threadData, setThreadData] = useState<MessageThreadTypeExtended[]>([]);

  useEffect(() => {
    const loadThreadsAsync = async () => {
      const accountId = account.ref?.id || '';
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

          // start getting more data
          const getRecipientProfile = await getProfileWithUid(
            firebaseFirestore,
            recipientId
          );
          const recipientName =
            account.data.type === 'company'
              ? await getNameForAccount(firebaseFirestore, recipientId)
              : await getTheaterNameForAccount(firebaseFirestore, recipientId);

          let threadPreviewImg =
            getRecipientProfile && getRecipientProfile?.profile_image_url
              ? getRecipientProfile?.profile_image_url
              : defaultPfp;

          // if the theater company doesn't have a pfp, use the production image if there is one
          if (threadPreviewImg === defaultPfp && thread.production_id) {
            const productionId =
              typeof thread.production_id === 'string'
                ? thread.production_id
                : thread.production_id.id;
            const productionData = await getProduction(
              firebaseFirestore,
              productionId
            );

            if (productionData && productionData?.production_image_url) {
              threadPreviewImg = productionData.production_image_url;
            }
          }

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
    <div className="h-full overflow-y-auto">
      <h4 className="mb-4 px-2 text-base font-semibold sm:px-0 sm:text-lg">
        Threads
      </h4>
      {loading ? (
        <p className="px-2 sm:px-0">Loading threads...</p>
      ) : (
        <div className="space-y-2 sm:space-y-4">
          {threadData && threadData.length ? (
            threadData.map((thread, i) => (
              <div
                key={`${thread.id}-${i}`}
                onClick={() => onThreadSelect(thread.id)}
                className={`flex cursor-pointer items-center rounded-lg border-b border-stone-200 p-2 pl-2 transition-colors sm:pl-3 ${
                  threadId === thread.id
                    ? 'bg-blue-100'
                    : thread.statusNew
                      ? 'bg-gray-100'
                      : 'bg-white'
                } hover:bg-gray-200 active:bg-gray-300`}
              >
                <img
                  src={thread.threadPreviewImg}
                  alt="Preview"
                  className="mr-2 h-8 w-8 flex-shrink-0 rounded-full sm:mr-3 sm:h-10 sm:w-10"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="m-0 mb-1 truncate p-0 text-sm font-semibold sm:mb-2 sm:text-base">
                    {thread.recipientName}
                  </h5>
                  <p className="text-gray-600 m-0 line-clamp-1 p-0 text-xs sm:text-sm">
                    {thread.last_message.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="px-2 sm:px-0">No threads available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageThreads;
