import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useHistory } from 'react-router-dom';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import { useMarketingContext } from '../../../context/MarketingContext';
import { submitLGLConstituent } from '../../../utils/marketing';
import PageContainer from '../../layout/PageContainer';
import Privacy from './Privacy';
import SignUpFooter, { SubmitBasicsResp } from './SignUpFooter';
import ActorInfo from './ActorInfo';
import IndividualBasics from './Basics';
import OffstageRoles from './OffstageRoles';
import { Tagline, Title } from '../../layout/Titles';
import IndividualRole from './Role';
import ImageUpload from '../../shared/ImageUpload';
import type {
  Gender,
  IndividualAccountInit,
  IndividualProfileInit,
  IndividualData,
  IndividualProfile,
  IndividualRoles,
  Pronouns,
  WebsiteTypes
} from './types';

// default object to track a boolean true/false for which steps have form validation error states
const createDefaultStepErrorsObj = (stepNames: string[]) => {
  const stepErrorsObj: { [key: string]: boolean } = {};
  // default all of our steps to false
  // because the pages will update this themselves
  // when errors or empty req fields arise or exist
  stepNames.forEach((stepName: string) => {
    stepErrorsObj[stepName] = false;
  });

  return stepErrorsObj;
};

const defaultSteps: Step[] = [
  { id: 'role' },
  { id: 'basics' },
  { id: 'privacy' },
  { id: 'offstageRoles' },
  { id: 'actorInfo' },
  { id: 'profilePhoto' }
];

// flatten our step id's into a single array
const flatSteps = (stepsArrObj: Step[]) => stepsArrObj.map((step) => step.id);

const defaultData: IndividualData = {
  actorInfo1Ethnicities: [],
  actorInfo1LGBTQ: '',
  actorInfo1Pronouns: '' as Pronouns,
  actorInfo1PronounsOther: '',
  actorInfo2AgeRanges: [],
  actorInfo2Gender: '' as Gender,
  actorInfo2GenderRoles: [],
  actorInfo2GenderTransition: '',
  actorInfo2HeightFt: 0,
  actorInfo2HeightIn: 0,
  actorInfo2HeightNoAnswer: true,
  basics18Plus: false,
  basicsEmailAddress: '',
  basicsFirstName: '',
  basicsLastName: '',
  basicsPassword: '',
  basicsPasswordConfirm: '',
  demographicsAgency: '',
  demographicsBioHeadline: '',
  demographicsBio: '',
  demographicsUnionStatus: '',
  demographicsUnionStatusOther: '',
  demographicsWebsites: [{ id: 1, url: '', websiteType: '' as WebsiteTypes }],
  emailListAgree: true,
  offstageRolesGeneral: [],
  offstageRolesHairMakeupCostumes: [],
  offstageRolesLighting: [],
  offstageRolesProduction: [],
  offstageRolesScenicAndProperties: [],
  offstageRolesSound: [],
  privacyAgreement: false,
  profilePhotoUrl: '',
  stageRole: '' as IndividualRoles
};

const IndividualSignUp: React.FC<{
  currentStep: number;
  setCurrentStep: (x: number) => void;
}> = ({ currentStep, setCurrentStep }) => {
  const history = useHistory();
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const { profile, setAccountRef, setProfileRef } = useProfileContext();
  const { lglApiKey } = useMarketingContext();
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [submitBasicsErr, setSubmitBasicsErr] = useState<
    SubmitBasicsResp | undefined
  >(undefined);

  // default state for form validation error states per step
  const [stepErrors, setStepErrors] = useState(
    createDefaultStepErrorsObj(flatSteps(steps))
  );

  // defaults for our defaultSteps
  const { step, index, navigation } = useStep({
    initialStep: currentStep,
    steps: steps
  });
  const stepId = (step as Step).id;

  // this large effect deals with conditional steps based on "roles" question
  // see Rules comment below for details
  useEffect(() => {
    let newSteps = [...steps];
    const { stageRole } = formData;
    const indexForOffstageRoles = newSteps.findIndex(
      (nS) => nS.id === 'offstageRoles'
    );
    const indexForActorInfo = newSteps.findIndex((nS) => nS.id === 'actorInfo');

    // Rules for conditional steps:
    // a. If the user selects "on-stage" then they see actor info 2 but not offstage roles
    // b. If the user selects "off-stage" then they see offstage roles but not actor info 2
    // c. If the user selects "both-stage" then they see both actor info 2 and offstage roles
    switch (stageRole) {
      case 'on-stage':
        // if we can't find the index for the step to remove, the user probably just went back
        if (indexForOffstageRoles > -1) {
          newSteps.splice(indexForOffstageRoles, 1);
        }
        break;
      case 'off-stage':
        // if we can't find the step we need here, we need to re-add it
        if (indexForOffstageRoles === -1 && indexForActorInfo > -1) {
          newSteps.splice(indexForActorInfo, 0, {
            id: 'offstageRoles'
          });
        }
        break;
      default:
        // let's just restore all of the steps
        newSteps = steps;
        break;
    }

    // no need to change state if we have no changes to steps
    if (JSON.stringify(steps) !== JSON.stringify(newSteps)) {
      setSteps(newSteps);
    }
  }, [formData.stageRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // we are just manually assuming they've agreed to this right now
  // remove once we clean this up
  const setPrivacyAgree = () => {
    const target = {
      name: 'privacyAgreement',
      value: true
    };
    setForm({ target });
  };

  const setProfilePicture = (url: string) => {
    const target = {
      name: 'profilePhotoUrl',
      value: url
    };
    setForm({ target });
  };

  // submit basics to Firebase, get response, set session
  const submitBasics: () => Promise<SubmitBasicsResp> = async () => {
    // we only get here if they've agreed to the privacy agreement
    setPrivacyAgree();

    // reset any sort of previous error response
    setSubmitBasicsErr(undefined);

    const {
      basicsFirstName,
      basicsLastName,
      basicsEmailAddress,
      basicsPassword,
      basics18Plus,
      emailListAgree,
      stageRole
    } = formData;

    return await createUserWithEmailAndPassword(
      firebaseAuth,
      basicsEmailAddress,
      basicsPassword
    )
      .then(async (res) => {
        try {
          const userId = res.user.uid;

          // create doc for account (extra fields not in auth)
          const accountInit: IndividualAccountInit = {
            type: 'individual',
            basics_18_plus: basics18Plus,
            email_list: emailListAgree,
            first_name: basicsFirstName,
            last_name: basicsLastName,
            privacy_agreement: true,
            uid: userId
          };
          const accountRef = await addDoc(
            collection(firebaseFirestore, 'accounts'),
            accountInit
          );

          // create doc for profile
          const profileInit: IndividualProfileInit = {
            uid: userId,
            account_id: accountRef.id,
            stage_role: stageRole,

            // init progress in signup flow
            completed_signup: true,
            completed_profile_1: false,
            completed_profile_2: false
          };
          const profileRef = await addDoc(
            collection(firebaseFirestore, 'profiles'),
            profileInit
          );

          // store account and profile refs so we can update them later
          setAccountRef(accountRef);
          setProfileRef(profileRef);

          // submit to marketing
          if (emailListAgree) {
            try {
              await submitLGLConstituent({
                api_key: lglApiKey,
                first_name: basicsFirstName,
                last_name: basicsLastName,
                email_address: basicsEmailAddress,
                account_type: 'individual'
              });
            } catch (e) {
              console.error('LGL Error', e);
            }
          }

          // successful case
          const resp = { ok: true };
          setSubmitBasicsErr(resp);

          return resp;
        } catch (e) {
          console.error('Error adding document:', e);

          const resp = {
            ok: false,
            code: 'profile-creation-error'
          };

          setSubmitBasicsErr(resp);

          return resp;
        }
      })
      .catch((err) => {
        console.log('Error creating user:', err);

        const resp = {
          ok: false,
          code: err.code ?? 'unknown-user-creation-error'
        };

        setSubmitBasicsErr(resp);

        return resp;
      });
  };

  // submit full sign up flow 1 profile data
  const submitSignUpProfile = async () => {
    const {
      actorInfo1Ethnicities,
      actorInfo1LGBTQ,
      actorInfo1Pronouns,
      actorInfo1PronounsOther,
      actorInfo2AgeRanges,
      actorInfo2Gender,
      actorInfo2GenderRoles,
      actorInfo2GenderTransition,
      actorInfo2HeightFt,
      actorInfo2HeightIn,
      actorInfo2HeightNoAnswer,
      demographicsAgency,
      demographicsBioHeadline,
      demographicsBio,
      demographicsUnionStatus,
      demographicsUnionStatusOther,
      demographicsWebsites, // { id, url, websiteType }
      offstageRolesGeneral,
      offstageRolesHairMakeupCostumes,
      offstageRolesLighting,
      offstageRolesProduction,
      offstageRolesScenicAndProperties,
      offstageRolesSound,
      profilePhotoUrl,
      stageRole
    } = formData;

    let profileTagline = '';

    switch (stageRole) {
      case 'on-stage':
        profileTagline = 'Actor';
        break;
      case 'off-stage':
        profileTagline = 'Offstage Professional';
        break;
      case 'both-stage':
        profileTagline = 'Actor, Offstage Professional';
        break;
      default:
        break;
    }

    const finalProfileData: IndividualProfile = {
      // actor info 1
      pronouns: actorInfo1Pronouns,
      pronouns_other: actorInfo1PronounsOther,
      lgbtqia: actorInfo1LGBTQ,
      ethnicities: actorInfo1Ethnicities,

      // actor info 2
      height_ft: actorInfo2HeightFt,
      height_in: actorInfo2HeightIn,
      height_no_answer: actorInfo2HeightNoAnswer,
      age_ranges: actorInfo2AgeRanges,
      gender_identity: actorInfo2Gender,
      gender_roles: actorInfo2GenderRoles,
      gender_transition: actorInfo2GenderTransition,

      // off-stage
      offstage_roles_general: offstageRolesGeneral,
      offstage_roles_production: offstageRolesProduction,
      offstage_roles_scenic_and_properties: offstageRolesScenicAndProperties,
      offstage_roles_lighting: offstageRolesLighting,
      offstage_roles_sound: offstageRolesSound,
      offstage_roles_hair_makeup_costumes: offstageRolesHairMakeupCostumes,

      // profile picture
      profile_image_url: profilePhotoUrl,

      // demographics
      union_status: demographicsUnionStatus,
      union_other: demographicsUnionStatusOther,
      agency: demographicsAgency,
      websites: demographicsWebsites,
      headline: demographicsBioHeadline,
      bio: demographicsBio,

      // profile tagline
      profile_tagline: profileTagline,

      // completed profile (new)
      completed_profile: true,

      // completed_profile (old)
      completed_profile_1: true
    };

    try {
      if (profile?.ref) {
        await updateDoc(profile.ref, { ...finalProfileData });
      } else {
        // no profileRef
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  // callback function for updating if a step has errors
  // we pass this down in the "hasErrorCallback" prop for the step
  const setStepErrorsCallback = (step: string, hasErrors: boolean) => {
    const newStepErrorsObj = { ...stepErrors };

    if (step in newStepErrorsObj) {
      newStepErrorsObj[step] = hasErrors;
    }

    setStepErrors(newStepErrorsObj);
  };

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (stepId) {
      case 'role':
        returnStep = <IndividualRole {...props} />;
        break;
      case 'basics':
        returnStep = (
          <IndividualBasics
            {...props}
            hasErrorCallback={setStepErrorsCallback}
            submitBasicsErr={submitBasicsErr}
          />
        );
        break;
      case 'privacy':
        returnStep = <Privacy {...props} />;
        break;
      case 'offstageRoles':
        returnStep = <OffstageRoles {...props} />;
        break;
      case 'actorInfo':
        returnStep = (
          <ActorInfo {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'profilePhoto':
        returnStep = (
          <>
            <Title>LET'S PUT A FACE TO THE NAME</Title>
            <Tagline>
              We just need one for now, but you can add more later.
            </Tagline>
            <ImageUpload
              onSave={(pfpImgUrl: string) => setProfilePicture(pfpImgUrl)}
              currentImgUrl=""
              modal={false}
            />
          </>
        );
        break;
      default:
        returnStep = <></>;
        break;
    }

    return returnStep;
  };

  const goToProfile = () => history.push('/profile');

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>{stepFrame()}</Col>
      </Row>
      <SignUpFooter
        landingStep={index}
        navigation={navigation}
        setLandingStep={setCurrentStep}
        submitSignUpProfile={submitSignUpProfile}
        currentStep={stepId}
        stepErrors={stepErrors}
        steps={steps}
        submitBasics={submitBasics}
        goToProfile={goToProfile}
      />
    </PageContainer>
  );
};

export default IndividualSignUp;
