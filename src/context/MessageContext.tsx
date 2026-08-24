import React, { createContext, useContext, useState, useEffect } from 'react';
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
  threads: MessageThreadType[];
  loadThreads: (accountId: string) => void;
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
  threads: [],
  loadThreads: () => null,
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
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );
  const [currentThreadMessages, setCurrentThreadMessages] = useState<
    MessageType[]
  >([]);

  const loadThreads = async (accountId: string) => {
    if (!accountId) {
      return;
    }

    const threadsRef = collection(firestore, 'threads');
    const currAccountRef = doc(firestore, 'accounts', accountId);
    const threadQuery = query(
      threadsRef,
      or(
        where('theater_account_id', '==', currAccountRef),
        where('talent_account_id', '==', currAccountRef)
      )
    );
    const threadSnapshot = await getDocs(threadQuery);
    const userThreads = threadSnapshot.docs.map(
      (threadDoc) =>
        ({
          ...threadDoc.data(),
          id: threadDoc.id
        }) as MessageThreadType
    );

    setThreads(userThreads);
  };

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

    const mapMessage = (messageDoc: { id: string; data: () => object }) =>
      ({
        ...messageDoc.data(),
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

    const mergeUnique = (
      ...snapshots: Array<{ docs: Array<{ id: string; data: () => object }> }>
    ) => {
      const seen = new Set<string>();
      const messages: MessageType[] = [];

      snapshots.forEach((snapshot) => {
        snapshot.docs.forEach((messageDoc) => {
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
    ) => {
      try {
        return await getDocs(messagesQuery);
      } catch (error) {
        console.error(errorLabel, error);
        return { docs: [] as Array<{ id: string; data: () => object }> };
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
    const accountId = account.ref?.id;
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
        threads,
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
