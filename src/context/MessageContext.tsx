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

export const MessageProvider: React.FC<{
  children: React.ReactNode;
  firestore: Firestore;
  threadIdParam?: string;
}> = ({ children, firestore, threadIdParam }) => {
  const { account } = useUserContext();
  const [threads, setThreads] = useState<MessageThreadType[]>([]);
  const [currentThread, setCurrentThread] = useState<MessageThreadType | null>(
    null
  );
  const [currentThreadMessages, setCurrentThreadMessages] = useState<
    MessageType[]
  >([]);

  const loadThreads = async (accountId: string) => {
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
      (doc) => ({ id: doc.id, ...doc.data() }) as MessageThreadType
    );

    setThreads(userThreads);
  };

  const loadThread = async (threadId: string) => {
    const threadDoc = doc(firestore, 'threads', threadId);
    const threadSnapshot = await getDoc(threadDoc);

    if (threadSnapshot.exists()) {
      const threadData = threadSnapshot.data() as MessageThreadType;
      setCurrentThread(threadData);
    }
  };

  const loadThreadMessages = async (
    sender_id: string,
    recipient_id: string,
    thread_id?: string
  ) => {
    const messagesRef = collection(firestore, 'messages');
    const senderRef = doc(firestore, 'accounts', sender_id);
    const recipientRef = doc(firestore, 'accounts', recipient_id);

    try {
      let messagesQuery = query(
        messagesRef,
        or(
          where('sender_id', 'in', [senderRef, recipientRef]),
          where('recipient_id', 'in', [senderRef, recipientRef])
        ),
        orderBy('timestamp', 'asc')
      );

      if (thread_id) {
        const threadsRef = doc(firestore, 'threads', thread_id);
        messagesQuery = query(
          messagesQuery,
          where('thread_id', '==', threadsRef)
        );
      }

      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesDocs = messagesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as MessageType
      );

      setCurrentThreadMessages(messagesDocs);
    } catch (error) {
      console.error('Could not fetch messages for thread', error);
    }
  };

  const updateThreadStatus = async (threadId: string, status: string) => {
    const accountId = account?.data?.uid;
    const threadDoc = doc(firestore, 'threads', threadId);

    await updateDoc(threadDoc, { status });

    // Refresh threads
    accountId && loadThreads(accountId);
  };

  useEffect(() => {
    if (!threadIdParam) {
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
