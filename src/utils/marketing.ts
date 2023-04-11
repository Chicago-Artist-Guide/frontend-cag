import axios from 'axios';
import { format } from 'date-fns';
import { IndividualRoles } from '../components/SignUp/Individual/types';

export type SubmitLGLConstituentParams = {
  api_key: string;
  first_name: string;
  last_name: string;
  email_address: string;
  account_type: 'individual' | 'company';
  stage_role?: IndividualRoles;
  org_name?: string;
};

export type LGLEmailAddress = {
  address: string;
  email_address_type_id: number;
  email_type_name: 'Home' | 'Work';
  is_preferred: boolean;
};

export type LGLCustomAttrs = {
  id: number;
  key: 'account_type' | 'stage_role';
  value: 'individual' | 'company' | IndividualRoles;
};

export type SubmitLGLConstituentPayload = {
  is_org: boolean;
  first_name: string;
  last_name: string;
  addressee: string; // first last
  alt_addressee: string;
  salutation: string; // first
  alt_salutation: string;
  sort_name: string; // last, first
  annual_report_name: string; // first last
  honorary_name: string; // first last
  date_added: string; // yyyy-mm-dd
  email_addresses: LGLEmailAddress[];
  custom_attrs: LGLCustomAttrs[];
  org_name?: string;
};

export const submitLGLConstituent = async ({
  api_key,
  first_name,
  last_name,
  email_address,
  account_type,
  stage_role,
  org_name
}: SubmitLGLConstituentParams) => {
  if (
    !first_name ||
    !email_address ||
    !api_key ||
    first_name === '' ||
    email_address === '' ||
    api_key === ''
  ) {
    return;
  }

  const fullName = `${first_name} ${last_name}`;
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const lglPayload: SubmitLGLConstituentPayload = {
    is_org: account_type === 'company',
    first_name,
    last_name,
    addressee: fullName,
    alt_addressee: fullName,
    salutation: first_name,
    alt_salutation: first_name,
    sort_name: `${last_name}, ${first_name}`,
    annual_report_name: fullName,
    honorary_name: fullName,
    date_added: currentDate,
    email_addresses: [
      {
        address: email_address,
        email_address_type_id: 1,
        email_type_name: account_type === 'company' ? 'Work' : 'Home',
        is_preferred: true
      }
    ],
    custom_attrs: [
      {
        id: 111,
        key: 'account_type',
        value: account_type
      }
    ]
  };

  if (stage_role) {
    lglPayload.custom_attrs.push({
      id: 222,
      key: 'stage_role',
      value: stage_role
    });
  }

  if (org_name) {
    lglPayload['org_name'] = org_name;
  }

  const lglUrl = 'https://api.littlegreenlight.com/api/v1/constituents.json';
  const headers = { Authorization: `Bearer ${api_key}` };

  await axios
    .post(lglUrl, lglPayload, { headers })
    .then((response) =>
      console.log('LGL Response for New Constituent:', response)
    );
};
