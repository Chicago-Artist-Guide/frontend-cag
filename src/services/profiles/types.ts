export interface ProfileData {
  uid: string;
  account_id: string;
  primary_contact_email?: string;
  profile_image_url?: string;
  theatre_name?: string;
}

export interface ProfileDto<TData extends ProfileData = ProfileData> {
  id: string;
  data: TData;
}

export type ProfilePatch = Partial<ProfileData> & Record<string, unknown>;
