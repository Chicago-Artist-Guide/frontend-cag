import {
  ProductionEquity,
  ProductionStatus,
  ProductionType,
  RoleStatus,
  StageRole
} from '../shared/profile.types';

export type TheaterAccount = {
  id: string;
  uid: string;
  type: string;
  email: string;
  theater_name: string;
  privacy_agreement: boolean;
};

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
  shows?: Production[];
  awards?: Award[];
};

export type Award = {
  award_id: string;
  award_name: string;
  award_year: string;
  awarded_by: string;
};

export type Production = {
  account_id: string;
  production_id: string;
  production_name: string;
  production_image_url?: string;
  type?: ProductionType;
  type_other?: string;
  status?: ProductionStatus;
  description?: string;
  director?: string;
  musical_director?: string;
  casting_director?: string;
  casting_director_email?: string;
  equity?: ProductionEquity;
  audition_start?: string;
  audition_end?: string;
  callback_start?: string;
  callback_end?: string;
  rehearsal_start?: string;
  rehearsal_end?: string;
  tech_week_start?: string;
  tech_week_end?: string;
  open_and_close_start?: string;
  open_and_close_end?: string;
  writers?: string;
  roles?: Role[];
  location: string;
  audition_location?: string;
  contact_person_name_offstage?: string;
  contact_person_email_offstage?: string;
  additional_notes_offstage?: string;
  contact_person_name_audition?: string;
  contact_person_email_audition?: string;
  materials_to_prepare_audition?: string;
  additional_notes_audition?: string;
};

export type Role = {
  type?: StageRole;
  role_id?: string;
  role_name?: string;
  offstage_role?: string;
  description?: string;
  role_rate?: number;
  role_rate_unit?: 'Total' | 'Per Week' | 'Per Hour';
  gender_identity?: string[];
  ethnicity?: string[];
  role_status?: RoleStatus;
  age_range?: string[];
  additional_requirements?: string[];
  union?: string;
};
