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
  timestamp: Date;
  status: string;
}

export interface LastMessage {
  content: string;
  message_id: string;
  timestamp: Date;
}

export interface MessageThreadType {
  id: string;
  created_at: Date;
  last_message: LastMessage;
  talent_account_id: DocumentReference<DocumentData> | string;
  talent_status: string;
  theater_account_id: DocumentReference<DocumentData> | string;
  theater_status: string;
  updated_at: Date;
}
