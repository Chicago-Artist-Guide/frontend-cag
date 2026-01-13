import axios from 'axios';
import { format } from 'date-fns';
import { IndividualRoles } from '../components/SignUp/Individual/types';
import { AccountTypeOptions } from '../components/SignUp/types';

export type SubmitLGLConstituentParams = {
  api_key: string;
  first_name: string;
  last_name: string;
  email_address: string;
  account_type: AccountTypeOptions;
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
  value: AccountTypeOptions | IndividualRoles;
};

export type LGLGroup = {
  group_id: number;
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
  org_name?: string;
  groups: LGLGroup[];
};

export const submitLGLConstituent = async ({
  api_key,
  first_name,
  last_name,
  email_address,
  account_type,
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
    groups: []
  };

  if (org_name) {
    lglPayload['org_name'] = org_name;
  }

  // get groups
  const lglGroupsUrl =
    'https://api.littlegreenlight.com/api/v1/groups.json?limit=25';
  const headers = { Authorization: `Bearer ${api_key}` };

  const groupsResp = await axios.get(lglGroupsUrl, { headers });
  const groupItems = groupsResp?.data?.items || [];

  if (groupItems.length) {
    const findKey = account_type === 'company' ? 'producing_company' : 'artist';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constituentGroup = groupItems.find((i: any) => i.key === findKey);

    if (constituentGroup) {
      lglPayload.groups.push({ group_id: constituentGroup.id });
    }
  }

  const lglUrl = 'https://api.littlegreenlight.com/api/v1/constituents.json';

  await axios
    .post(lglUrl, lglPayload, { headers })
    .then((response) =>
      console.log('LGL Response for New Constituent:', response)
    );
};

export const zeffyUrl =
  'https://www.zeffy.com/en-US/donation-form/bf4f5b40-de6b-44d1-9276-ef91daa82842';
