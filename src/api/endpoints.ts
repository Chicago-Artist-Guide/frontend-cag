import axios, { AxiosPromise } from 'axios';

const base = '/api/';

const paths = {
  SIGN_UP: `${base}user/sign_up`,
  CREATE_PROFILE: `${base}user/create_profile`,
  EXTRA_INFORMATION: `${base}user/extra_information`,
  PROFILE_PHOTO_UPLOAD: `${base}user/profile_photo_upload`,
  UPCOMING_SHOW_PHOTO_UPLOAD: `${base}/upcoming_show_photo_upload`
};

interface SubmitSignUpStep {
  landingPerformTypeOnStage: boolean;
  landingPerformTypeOffStage: boolean;
  basicsFirstName: string;
  basicsLastName: string;
  basicsEmailAddress: string;
  basicsPassword: string;
  basics18Plus: boolean; // record of agreement
  privacyAgreement: boolean; // record of agreement
}

const submitSignUpStep = (step: SubmitSignUpStep): AxiosPromise<void> => {
  const payload = {
    onStage: step.landingPerformTypeOnStage,
    offStage: step.landingPerformTypeOffStage,
    firstName: step.basicsFirstName,
    lastName: step.basicsLastName,
    email: step.basicsEmailAddress,
    password: step.basicsPassword,
    agreeAge: step.basics18Plus,
    agreePrivacy: step.privacyAgreement
  };

  return axios.post(paths.SIGN_UP, payload);
};

export { submitSignUpStep };
