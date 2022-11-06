export interface FormValues {
  theatreName: string;
  emailAddress: string;
  password: string;
  passwordConfirm: string;
  numberOfMembers: string;
  primaryContact: string;
  location: string;
  description: string;
  privacyAgreement: boolean;
  profilePhotoUrl: string;
}

export type FormStep = 'basics' | 'details' | 'privacy' | 'photo';

export type SubmitResponse = {
  ok: boolean;
  code?: string;
};
