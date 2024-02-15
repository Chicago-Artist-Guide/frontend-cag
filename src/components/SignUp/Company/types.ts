export type CompanyData = {
  theatreName: string;
  emailAddress: string;
  password: string;
  passwordConfirm: string;
  numberOfMembers: string;
  primaryContact: string;
  primaryContactEmail: string;
  location: string;
  description: string;
  website: string;
  equity: string;
  privacyAgreement: boolean;
  profilePhotoUrl: string;
};

export type FormStep = 'basics' | 'privacy' | 'details';

export type SubmitResponse = {
  ok: boolean;
  code?: string;
};
