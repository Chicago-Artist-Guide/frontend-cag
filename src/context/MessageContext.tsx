import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  where,
  query,
  or,
  orderBy
} from 'firebase/firestore';
import { useUserContext } from './UserContext';
import { MessageThreadType, MessageType } from '../components/Messages/types';

interface MessageContextType {
  clearMessages: () => void;
  threads: MessageThreadType[];
  threadsAccountId: string | null;
  loadThreads: (accountId: string) => Promise<void>;
  currentThread: MessageThreadType | null;
  loadThread: (threadId: string) => void;
  updateThreadStatus: (threadId: string, status: string) => void;
  loadThreadMessages: (
    sender_id: string,
    recipient_id: string,
    thread_id?: string
  ) => void;
  currentThreadMessages: MessageType[];
}

const MessageContext = createContext<MessageContextType>({
  clearMessages: () => undefined,
  threads: [],
  threadsAccountId: null,
  loadThreads: async () => undefined,
  currentThread: null,
  loadThread: () => null,
  updateThreadStatus: () => null,
  loadThreadMessages: () => null,
  currentThreadMessages: []
});

export const useMessages = () => useContext(MessageContext);

export const MessageProvider: React.FC<
  React.PropsWithChildren<{
    children: React.ReactNode;
    firestore: Firestore;
    threadIdParam?: string;
  }>
> = ({ children, firestore, threadIdParam }) => {
  const { account } = useUserContext();
  const [threads, setThreads] = useState<MessageThreadType[]>([]);
  const [threadsAccountId, setThreadsAccountId] = useState<string | null>(null);
  const threadLoadVersion = useRef(0);
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );
  const [currentThreadMessages, setCurrentThreadMessages] = useState<
    MessageType[]
  >([]);

  const clearMessages = useCallback(() => {
    threadLoadVersion.current += 1;
    setThreads([]);
    setThreadsAccountId(null);
    setCurrentThread(null);
    setCurrentThreadMessages([]);
  }, []);

  const accountUid = account?.data?.uid as string | undefined;

  const loadThreads = useCallback(
    async (accountId: string) => {
      if (!accountId) {
        return;
      }

      const loadVersion = threadLoadVersion.current + 1;
      threadLoadVersion.current = loadVersion;
      setThreads([]);
      setThreadsAccountId(null);

      const threadsRef = collection(firestore, 'threads');

      const fetchThreadsForAccountRef = async (
        accountRef: ReturnType<typeof doc>
      ) => {
        const threadQuery = query(
          threadsRef,
          or(
            where('theater_account_id', '==', accountRef),
            where('talent_account_id', '==', accountRef)
          )
        );
        const threadSnapshot = await getDocs(threadQuery);
        return threadSnapshot.docs;
      };

      const seen = new Set<string>();
      const userThreads: MessageThreadType[] = [];

      const addThreadDocs = (
        threadDocs: Awaited<ReturnType<typeof fetchThreadsForAccountRef>>
      ) => {
        threadDocs.forEach((threadDoc) => {
          if (seen.has(threadDoc.id)) {
            return;
          }
          seen.add(threadDoc.id);
          userThreads.push({
            ...threadDoc.data(),
            id: threadDoc.id
          } as MessageThreadType);
        });
      };

      try {
        addThreadDocs(
          await fetchThreadsForAccountRef(doc(firestore, 'accounts', accountId))
        );
      } catch (error) {
        console.error('Could not load threads', error);
        return;
      }

      // Talent Apply used to store theater_account_id as accounts/{authUid}.
      // Query that separately — folding it into the same or() makes Firestore
      // deny the whole list when those refs fail the participant get().
      if (accountUid && accountUid !== accountId) {
        try {
          addThreadDocs(
            await fetchThreadsForAccountRef(
              doc(firestore, 'accounts', accountUid)
            )
          );
        } catch (legacyError) {
          console.error('Could not load legacy uid-keyed threads', legacyError);
        }
      }

      if (threadLoadVersion.current !== loadVersion) {
        return;
      }

      setThreads(userThreads);
      setThreadsAccountId(accountId);
    },
    [firestore, accountUid]
  );

  const loadThread = async (threadId: string) => {
    try {
      const threadDoc = doc(firestore, 'threads', threadId);
      const threadSnapshot = await getDoc(threadDoc);

      if (threadSnapshot.exists()) {
        setCurrentThread({
          ...threadSnapshot.data(),
          id: threadSnapshot.id
        } as MessageThreadType);
      } else {
        setCurrentThread(null);
      }
    } catch (error) {
      console.error('Could not fetch thread', error);
      setCurrentThread(null);
    }
  };

  const loadThreadMessages = async (
    sender_id: string,
    recipient_id: string,
    thread_id?: string
  ) => {
    if (!sender_id) {
      return;
    }

    const messagesRef = collection(firestore, 'messages');
    const currentUserRef = doc(firestore, 'accounts', sender_id);

    type MessageDoc = Awaited<ReturnType<typeof getDocs>>['docs'][number];

    const mapMessage = (messageDoc: MessageDoc) =>
      ({
        ...(messageDoc.data() as object),
        id: messageDoc.id
      }) as MessageType;

    const toMillis = (timestamp: MessageType['timestamp']) => {
      if (!timestamp) {
        return 0;
      }

      const withToMillis = timestamp as unknown as { toMillis?: () => number };
      if (typeof withToMillis.toMillis === 'function') {
        return withToMillis.toMillis();
      }

      if (timestamp instanceof Date) {
        return timestamp.getTime();
      }

      const withSeconds = timestamp as unknown as { seconds?: number };
      if (typeof withSeconds.seconds === 'number') {
        return withSeconds.seconds * 1000;
      }

      return 0;
    };

    const mergeUnique = (...docLists: MessageDoc[][]) => {
      const seen = new Set<string>();
      const messages: MessageType[] = [];

      docLists.forEach((docs) => {
        docs.forEach((messageDoc) => {
          if (seen.has(messageDoc.id)) {
            return;
          }
          seen.add(messageDoc.id);
          messages.push(mapMessage(messageDoc));
        });
      });

      return messages;
    };

    const tryQuery = async (
      messagesQuery: ReturnType<typeof query>,
      errorLabel: string
    ): Promise<MessageDoc[]> => {
      try {
        const snapshot = await getDocs(messagesQuery);
        return snapshot.docs;
      } catch (error) {
        console.error(errorLabel, error);
        return [];
      }
    };

    let messagesDocs: MessageType[] = [];

    // Prefer a thread_id query (allowed once rules treat thread
    // participants as message readers). Also try sender/recipient
    // constraints so we still match if thread_id is stored as a ref
    // or a string, or if the thread-scoped query is denied.
    if (thread_id) {
      const threadRef = doc(firestore, 'threads', thread_id);
      const byThreadRefSnapshot = await tryQuery(
        query(messagesRef, where('thread_id', '==', threadRef)),
        'Could not fetch messages by thread ref'
      );
      const byThreadIdSnapshot = await tryQuery(
        query(messagesRef, where('thread_id', '==', thread_id)),
        'Could not fetch messages by thread id string'
      );
      const sentInThreadSnapshot = await tryQuery(
        query(
          messagesRef,
          where('sender_id', '==', currentUserRef),
          where('thread_id', '==', threadRef),
          orderBy('timestamp', 'asc')
        ),
        'Could not fetch sent messages in thread'
      );
      const receivedInThreadSnapshot = await tryQuery(
        query(
          messagesRef,
          where('recipient_id', '==', currentUserRef),
          where('thread_id', '==', threadRef),
          orderBy('timestamp', 'asc')
        ),
        'Could not fetch received messages in thread'
      );

      messagesDocs = mergeUnique(
        byThreadRefSnapshot,
        byThreadIdSnapshot,
        sentInThreadSnapshot,
        receivedInThreadSnapshot
      );
    }

    if (!messagesDocs.length) {
      const sentSnapshot = await tryQuery(
        query(messagesRef, where('sender_id', '==', currentUserRef)),
        'Could not fetch sent messages'
      );
      const receivedSnapshot = await tryQuery(
        query(messagesRef, where('recipient_id', '==', currentUserRef)),
        'Could not fetch received messages'
      );
      const counterpartIds = new Set([sender_id, recipient_id].filter(Boolean));

      messagesDocs = mergeUnique(sentSnapshot, receivedSnapshot).filter(
        (message) => {
          const senderIdStr =
            typeof message.sender_id === 'string'
              ? message.sender_id
              : message.sender_id?.id;
          const recipientIdStr =
            typeof message.recipient_id === 'string'
              ? message.recipient_id
              : message.recipient_id?.id;

          const isBetweenPair =
            counterpartIds.has(senderIdStr) &&
            counterpartIds.has(recipientIdStr);

          if (!isBetweenPair) {
            return false;
          }

          if (!thread_id || !message.thread_id) {
            return true;
          }

          const messageThreadId =
            typeof message.thread_id === 'string'
              ? message.thread_id
              : message.thread_id.id;

          return messageThreadId === thread_id;
        }
      );
    }

    messagesDocs.sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp));
    setCurrentThreadMessages(messagesDocs);
  };

  const updateThreadStatus = async (threadId: string, status: string) => {
    const accountId = account.id;
    const threadDoc = doc(firestore, 'threads', threadId);

    await updateDoc(threadDoc, { status });

    // Refresh threads
    accountId && loadThreads(accountId);
  };

  useEffect(() => {
    if (!threadIdParam) {
      setCurrentThread(null);
      return;
    }

    loadThread(threadIdParam);
  }, [threadIdParam]);

  return (
    <MessageContext.Provider
      value={{
        clearMessages,
        threads,
        threadsAccountId,
        loadThreads,
        currentThread,
        loadThread,
        updateThreadStatus,
        loadThreadMessages,
        currentThreadMessages
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
