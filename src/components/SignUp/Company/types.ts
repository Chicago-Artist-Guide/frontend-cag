export type FormValues = {
  theatreName: string;
  emailAddress: string;
  password: string;
  numberOfMembers: number;
  primaryContact: string;
  location: string;
  description: string;
  privacyAgreement: boolean;
  profilePhotoUrl: string;
};

export type FormStep = 'basics' | 'details' | 'privacy' | 'photo';
