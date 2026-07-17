export type AccountType = 'individual' | 'company';

export interface AccountData {
  uid: string;
  type: AccountType;
  email?: string;
  first_name?: string;
  last_name?: string;
  theater_name?: string;
}

export interface AccountDto<TData extends AccountData = AccountData> {
  id: string;
  data: TData;
}

export type AccountPatch = Partial<AccountData> & Record<string, unknown>;
