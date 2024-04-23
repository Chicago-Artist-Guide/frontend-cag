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

export interface MessageThread {
  role_id: string;
  messages: MessageType[];
}
