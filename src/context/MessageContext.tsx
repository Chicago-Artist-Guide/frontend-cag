import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { useUserContext } from './UserContext';
import { MessageThreadType } from '../components/Messages/types';

interface MessageContextType {
  threads: MessageThreadType[];
  loadThreads: (accountId: string) => void;
  currentThread: MessageThreadType | null;
  loadThread: (threadId: string) => void;
  updateThreadStatus: (threadId: string, status: string) => void;
  updateMessageStatus: (
    threadId: string,
    messageId: string,
    status: string
  ) => void;
}

const MessageContext = createContext<MessageContextType>({
  threads: [],
  loadThreads: () => null,
  currentThread: null,
  loadThread: () => null,
  updateThreadStatus: () => null,
  updateMessageStatus: () => null
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

  const loadThreads = async (accountId: string) => {
    const threadsCollection = collection(firestore, 'threads');
    const threadsSnapshot = await getDocs(threadsCollection);

    if (!threadsSnapshot.empty) {
      const threadsData = threadsSnapshot.docs.map(
        (doc) => doc.data() as MessageThreadType
      );
      const userThreads = threadsData.filter(
        (thread) =>
          thread.talent_account_id === accountId ||
          thread.theater_account_id === accountId
      );

      console.log(userThreads);

      setThreads(userThreads);
    }
  };

  const loadThread = async (threadId: string) => {
    const threadDoc = doc(firestore, 'threads', threadId);
    const threadSnapshot = await getDoc(threadDoc);

    if (threadSnapshot.exists()) {
      const threadData = threadSnapshot.data() as MessageThreadType;
      setCurrentThread(threadData);
    }
  };

  const updateThreadStatus = async (threadId: string, status: string) => {
    const accountId = account?.data?.uid;
    const threadDoc = doc(firestore, 'threads', threadId);

    await updateDoc(threadDoc, { status });

    // Refresh threads
    accountId && loadThreads(accountId);
  };

  const updateMessageStatus = async (
    threadId: string,
    messageId: string,
    status: string
  ) => {
    const threadDoc = doc(firestore, 'threads', threadId);
    const threadSnapshot = await getDoc(threadDoc);

    if (threadSnapshot.exists()) {
      const threadData = threadSnapshot.data() as MessageThreadType;
      const updatedMessages = threadData.messages.map((message) =>
        message.id === messageId ? { ...message, status } : message
      );

      await updateDoc(threadDoc, { messages: updatedMessages });

      // Refresh current thread
      loadThread(threadId);
    }
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
        updateMessageStatus
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
