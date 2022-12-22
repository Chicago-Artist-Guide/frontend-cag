export type Profile = {
  account_id: string;
  complete_profile: boolean;
  description?: string;
  location?: string;
  number_of_members?: string;
  primary_contact?: string;
  primary_contact_email?: string;
  profile_image_url?: string;
  additional_photos?: { [key: string]: string };
  theatre_name: string;
  uid: string;
};

export type Show = {
  production_name: string;
  production_image_url?: string;
  type?: 'musical' | 'play' | 'other';
  type_other?: string;
  status?: 'open_casting' | 'auditioning' | 'production';
  description?: string;
  director?: string;
  musical_director?: string;
  equity?: 'union' | 'non-union';
  audition_dates?: ShowDate;
  callback_dates?: ShowDate;
  rehearsal_dates?: ShowDate;
  tech_week_dates?: ShowDate;
  open_and_close_dates?: ShowDate;
};

type ShowDate = {
  start: Date;
  end: Date;
};
