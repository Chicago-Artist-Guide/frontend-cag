import React, { createContext, useContext, useState } from 'react';
import { Firestore } from 'firebase/firestore';
import {
  fetchMessagesByAccountAndRole,
  fetchSingleThread
} from '../utils/firebaseUtils';
import { MessageType, MessageThread } from '../components/Messages/types';

interface MessageContextType {
  threads: MessageThread[];
  loadThreads: (accountId: string, roleId?: string) => void;
  currentThread: MessageThread | null;
  loadThread: (roleId: string, fromId: string, toId: string) => void;
}

const MessageContext = createContext<MessageContextType>({
  threads: [],
  loadThreads: () => null,
  currentThread: null,
  loadThread: () => null
});
export const useMessages = () => useContext(MessageContext);

const groupMessagesByRoleId = (messages: MessageType[]): MessageThread[] => {
  const threadsMap = new Map<string, MessageType[]>();

  messages.forEach((message) => {
    const existingMessages = threadsMap.get(message.role_id) || [];
    existingMessages.push(message);
    threadsMap.set(message.role_id, existingMessages);
  });

  return Array.from(threadsMap, ([role_id, messages]) => ({
    role_id,
    messages
  }));
};

export const MessageProvider: React.FC<{
  children: React.ReactNode;
  firestore: Firestore;
}> = ({ children, firestore }) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentThread, setCurrentThread] = useState<MessageThread | null>(
    null
  );

  const loadThreads = async (accountId: string, roleId?: string) => {
    const fetchedMessages = await fetchMessagesByAccountAndRole(firestore, {
      accountId,
      roleId
    });
    const groupedThreads = groupMessagesByRoleId(fetchedMessages);
    setThreads(groupedThreads);
  };

  const loadThread = async (roleId: string, fromId: string, toId: string) => {
    const fetchedThreadMessages = await fetchSingleThread(
      firestore,
      roleId,
      fromId,
      toId
    );
    setCurrentThread({ role_id: roleId, messages: fetchedThreadMessages });
  };

  return (
    <MessageContext.Provider
      value={{ threads, loadThreads, currentThread, loadThread }}
    >
      {children}
    </MessageContext.Provider>
  );
};
