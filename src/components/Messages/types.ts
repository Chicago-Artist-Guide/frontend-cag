import { DocumentReference, DocumentData } from 'firebase/firestore';

export interface MessageFilters {
  accountId?: string; // company or talent account id
  roleId?: string;
}

export interface MessageType {
  id: string;
  sender_id: DocumentReference<DocumentData> | string;
  recipient_id: DocumentReference<DocumentData> | string;
  content: string;
  action?: string;
  message_type?: 'message' | 'email_sent';
  timestamp: Date;
  status: string;
  thread_id?: DocumentReference<DocumentData> | string;
}

export interface LastMessage {
  content: string;
  message_id: string;
  timestamp: Date;
}

export interface MessageThreadType {
  id: string;
  created_at: Date;
  last_message?: LastMessage;
  talent_account_id: DocumentReference<DocumentData> | string;
  talent_status: string;
  theater_account_id: DocumentReference<DocumentData> | string;
  theater_status: string;
  updated_at: Date;
  production_id?: DocumentReference<DocumentData> | string;
  role_id?: string;
  // Present when loadThreads collapsed a uid-keyed Apply thread with the
  // later doc-id-keyed thread for the same pair. MessageThread should load
  // messages from these ids as well so the conversation stays whole.
  mergedFromThreadIds?: string[];
}
