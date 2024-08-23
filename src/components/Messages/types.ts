export interface MessageFilters {
  accountId?: string; // company or talent account id
  roleId?: string;
}

export interface MessageType {
  id: string;
  from_id: string;
  to_id: string;
  role_id: string;
  message: string;
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
  talent_account_id: string;
  talent_status: string;
  theater_account_id: string;
  theater_status: string;
  updated_at: Date;
  messages: MessageType[];
}
