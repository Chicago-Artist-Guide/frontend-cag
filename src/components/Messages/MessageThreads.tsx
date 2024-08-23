import React, { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useMessages } from '../../context/MessageContext';

interface MessageThreadsProps {
  onThreadSelect: (threadId: string) => void;
}

const MessageThreads: React.FC<MessageThreadsProps> = ({ onThreadSelect }) => {
  const { account } = useUserContext();
  const { threads, loadThreads } = useMessages();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accountId = account?.data?.uid;
    loadThreads(accountId);
  }, [account]);

  return (
    <div>
      <h4>Threads Sidebar</h4>
      {loading ? (
        <>
          {threads && threads.length ? (
            <>
              {threads.map((thread, i) => (
                <div
                  key={`${thread.id}-${i}`}
                  onClick={() => onThreadSelect(thread.id)}
                >
                  {thread.last_message.content}
                </div>
              ))}
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <p>Loading Threads</p>
      )}
    </div>
  );
};

export default MessageThreads;
