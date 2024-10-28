import clsx from 'clsx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { getAccountWithAccountId } from '../Profile/shared/api';
import { createMessageThread, createEmail } from '../Messages/api';
import {
  NO_EMAIL,
  theaterToArtistMessage,
  theaterToArtistEmailSubject,
  theaterToArtistEmailText,
  theaterToArtistEmailHtml
} from '../Messages/messages';
import { createTheaterTalentMatch } from './api';
import { MatchConfirmationModal } from './MatchConfirmationModal';

type TalentMatchCardProps = {
  profile: ProfileAndName;
  productionId: string;
  productionName: string;
  roleId: string;
  roleName: string;
  fetchFullNames: () => Promise<void>;
};

export type ProfileAndName = IndividualProfileDataFullInit & {
  fullName: string;
  matchStatus: boolean | null;
};

export const TalentMatchCard = ({
  profile,
  productionId,
  productionName,
  roleId,
  roleName,
  fetchFullNames
}: TalentMatchCardProps) => {
  const navigate = useNavigate();
  const { account, currentUser, profile: userProfile } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchType, setMatchType] = useState<boolean | null>(null);
  const { fullName, matchStatus } = profile;
  const isDeclined = matchStatus === false;
  const isAccepted = matchStatus === true;

  const sendEmailToTalent = async () => {
    if (!profile.account_id) {
      console.error('Could not find account id for profile');
      return false;
    }

    const talentAccount = await getAccountWithAccountId(
      firebaseFirestore,
      profile.account_id
    );
    const subject = theaterToArtistEmailSubject(roleName, productionName);
    const messageContent = theaterToArtistEmailText(
      userProfile?.data.theatre_name,
      roleName,
      productionName,
      userProfile.data.primary_contact_email || currentUser?.email || NO_EMAIL
    );
    const messageContentHtml = theaterToArtistEmailHtml(
      userProfile?.data.theatre_name,
      roleName,
      productionName,
      userProfile.data.primary_contact_email || currentUser?.email || NO_EMAIL
    );

    if (!talentAccount || !talentAccount?.email) {
      console.error(
        'Could not find account or account email address for talent.'
      );
      return false;
    }

    const toEmail = talentAccount?.email;
    await createEmail(
      firebaseFirestore,
      toEmail,
      subject,
      messageContent,
      messageContentHtml
    );
  };

  const createMatch = async (status: boolean) => {
    try {
      const talentAccountId = profile.account_id;
      const currUserAccountId = account.ref?.id;

      await createTheaterTalentMatch(
        firebaseFirestore,
        productionId,
        roleId,
        talentAccountId,
        status,
        'theater'
      );

      if (!currUserAccountId) {
        console.error('Caanot find current user ref account id.');
        return false;
      }

      await fetchFullNames();

      // only send message and email if accepted
      if (status) {
        const messageContent = theaterToArtistMessage(
          roleName,
          productionName,
          userProfile.data.primary_contact_email ||
            currentUser?.email ||
            NO_EMAIL
        );
        const messageThreadId = await createMessageThread(
          firebaseFirestore,
          currUserAccountId,
          talentAccountId,
          messageContent,
          'theater',
          productionId,
          roleId
        );

        // send email
        await sendEmailToTalent();

        return messageThreadId;
      }

      return null;
    } catch (error) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      Swal.fire({
        title: 'Error!',
        text: `There was an error creating the match: ${errorMessage}`,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      console.error(error);
    }
  };

  const handleConfirm = async () => {
    setIsModalVisible(false);

    if (matchType !== null) {
      const threadId = await createMatch(matchType);
      navigate(`/profile/messages/${threadId}`);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setMatchType(null);
  };

  const returnModalMessage = () => (
    <>
      Please confirm you would like to express interest in{' '}
      <strong>{fullName}</strong> for the following role:
      <span className="mx-2 my-8 block rounded-xl bg-stone-200 px-4 py-2">
        <strong>{roleName}</strong> in <em>{productionName}</em>
      </span>
      Once you click Confirm, a new message thread will be created with the
      talent.
    </>
  );

  return (
    <div className="flex h-[272px] min-w-[812px] bg-white">
      <div
        className="relative w-[272px] flex-none bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${profile.profile_image_url})`
        }}
      >
        <div className="absolute left-4 top-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-10 text-banana"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-8 py-4 font-montserrat -tracking-tighter">
        <h3 className="mb-4 text-2xl font-bold">{fullName}</h3>
        <div className="grid grid-cols-2 gap-2 text-base">
          <div>Ethnicity</div>
          <div className="font-semibold">
            {profile.ethnicities?.join(', ') || 'N/A'}
          </div>
          <div>Age Range</div>
          <div className="font-semibold">
            {profile.age_ranges?.join(', ') || 'N/A'}
          </div>
          <div>Gender</div>
          <div className="font-semibold">
            {profile.gender_identity || 'N/A'}
          </div>
          <div>Special Skills</div>
          <div className="font-semibold">
            {profile.additional_skills_checkboxes?.join(', ')}{' '}
            {profile.additional_skills_manual?.join(', ')}
          </div>
          <div>Other</div>
          <div className="font-semibold">N/A</div>
        </div>
      </div>

      <div className="flex flex-none flex-col">
        <button
          onClick={() => {
            setMatchType(true);
            setIsModalVisible(true);
          }}
          disabled={isAccepted}
          className={clsx('h-full bg-yoda/50 px-4 py-2 text-mint', {
            'cursor-not-allowed opacity-50': isAccepted,
            'hover:bg-mint/50 hover:text-white': !isAccepted
          })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <span className="font-montserrat text-base font-bold uppercase -tracking-tighter">
            Accept
          </span>
        </button>
        <button
          onClick={() => createMatch(false)}
          disabled={isDeclined}
          className={clsx(
            'flex h-full flex-col items-center justify-center bg-blush/50 px-4 py-2 text-salmon',
            {
              'cursor-not-allowed opacity-50': isDeclined,
              'hover:bg-salmon/50 hover:text-white': !isDeclined
            }
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-20"
          >
            <path
              fillRule="evenodd"
              d="m6.72 5.66 11.62 11.62A8.25 8.25 0 0 0 6.72 5.66Zm10.56 12.68L5.66 6.72a8.25 8.25 0 0 0 11.62 11.62ZM5.105 5.106c3.807-3.808 9.98-3.808 13.788 0 3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-montserrat text-base font-bold uppercase -tracking-tighter">
            Decline
          </span>
        </button>
      </div>
      {isModalVisible && (
        <MatchConfirmationModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          message={returnModalMessage()}
        />
      )}
    </div>
  );
};
