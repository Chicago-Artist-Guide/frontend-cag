import axios, { AxiosPromise } from 'axios';

const base = 'https://cag-backend-api.herokuapp.com/';
const headers = {
  authKey: 'mockAuthKey'
};

const paths = {
  SIGN_UP: `${base}user/register`,
  CREATE_PROFILE: `${base}user/create_profile`,
  EXTRA_INFORMATION: `${base}user/extra_information`,
  PROFILE_PHOTO_UPLOAD: `${base}user/profile_photo_upload`,
  UPCOMING_SHOW_PHOTO_UPLOAD: `${base}upcoming_show_photo_upload`
};

interface SubmitSignUpStep {
  basicsFirstName: string;
  basicsLastName: string;
  basicsEmailAddress: string;
  basicsPassword: string;
  basics18Plus: boolean; // record of agreement
  privacyAgreement: boolean; // record of agreement
}

const submitSignUpStep = (step: SubmitSignUpStep): AxiosPromise<void> => {
  const payload = {
    first_name: step.basicsFirstName,
    last_name: step.basicsLastName,
    email: step.basicsEmailAddress,
    pass: step.basicsPassword,
    agreed_18: step.basics18Plus,
    agreed_privacy: step.privacyAgreement
  };

  return axios.post(paths.SIGN_UP, payload, { headers });
};

export { submitSignUpStep };
