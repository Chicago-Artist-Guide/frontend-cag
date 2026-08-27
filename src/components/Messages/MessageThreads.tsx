import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMessages } from '../../context/MessageContext';
import {
  getAccountDisplayName,
  getTheaterDisplayNameByUid
} from '../../services/accounts/client';
import { findProfileByUidOrAccountId } from '../../services/profiles/client';
import { getProduction } from '../Profile/Company/api';
import { MessageThreadType } from './types';
import { getConversationPreview } from './messages';
import { defaultPfp } from '../../config/publicImages';

interface MessageThreadsProps {
  onThreadSelect: (threadId: string) => void;
}

type MessageThreadTypeExtended = MessageThreadType & {
  threadPreviewImg: string;
  recipientName: string;
  statusNew: boolean;
};

const MessageThreads: React.FC<
  React.PropsWithChildren<MessageThreadsProps>
> = ({ onThreadSelect }) => {
  const { threadId } = useParams();
  const { account } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const { clearMessages, threads, threadsAccountId, loadThreads } =
    useMessages();
  const [loading, setLoading] = useState(true);
  const [threadData, setThreadData] = useState<MessageThreadTypeExtended[]>([]);

  useEffect(() => {
    clearMessages();
    setThreadData([]);

    if (!account.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadThreads(account.id);
  }, [account.id, clearMessages, loadThreads]);

  useEffect(() => {
    if (!account.id || threadsAccountId !== account.id) {
      setThreadData([]);
      return;
    }

    let active = true;
    const fetchThreadsData = async () => {
      const data = await Promise.all(
        threads.map(async (thread) => {
          const whichStatus =
            account.data?.type === 'company'
              ? thread.theater_status
              : thread.talent_status;
          const statusNew = whichStatus === 'new';
          const recipientIdRef =
            account.data?.type === 'company'
              ? thread.talent_account_id
              : thread.theater_account_id;
          const recipientId =
            typeof recipientIdRef === 'string'
              ? recipientIdRef
              : recipientIdRef.id;

          // start getting more data
          const getRecipientProfile =
            await findProfileByUidOrAccountId(recipientId);
          const recipientName =
            account.data?.type === 'company'
              ? await getAccountDisplayName(recipientId)
              : await getTheaterDisplayNameByUid(recipientId);

          let threadPreviewImg = getRecipientProfile?.data?.profile_image_url
            ? getRecipientProfile.data.profile_image_url
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

      if (active) {
        setThreadData(data);
        setLoading(false);
      }
    };

    fetchThreadsData();
    return () => {
      active = false;
    };
  }, [account, firebaseFirestore, threads, threadsAccountId]);

  const hasCurrentAccountThreads =
    Boolean(account.id) && threadsAccountId === account.id;

  return (
    <div className="h-full overflow-y-auto">
      <h4 className="mb-4 px-2 text-base font-semibold sm:px-0 sm:text-lg">
        Threads
      </h4>
      {account.id && (!hasCurrentAccountThreads || loading) ? (
        <p className="px-2 sm:px-0">Loading threads...</p>
      ) : (
        <div className="space-y-2 sm:space-y-4">
          {threadData && threadData.length ? (
            threadData.map((thread, i) => (
              <button
                type="button"
                key={`${thread.id}-${i}`}
                onClick={() => onThreadSelect(thread.id)}
                className={`flex w-full cursor-pointer items-center rounded-lg border-b border-stone-200 p-2 pl-2 text-left transition-colors sm:pl-3 ${
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
                    {getConversationPreview(thread.last_message?.content)}
                  </p>
                </div>
              </button>
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
