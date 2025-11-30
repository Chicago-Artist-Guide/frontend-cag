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
  isFavorited: boolean;
  onToggleFavorite: () => Promise<void>;
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
  fetchFullNames,
  isFavorited,
  onToggleFavorite
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
    <div
      className={clsx('flex min-h-[272px] max-w-[812px] flex-col lg:flex-row', {
        'border-4 border-mint bg-yoda/25': isAccepted,
        'border-4 border-salmon bg-blush/25': isDeclined
      })}
    >
      <div
        className="relative h-64 w-full flex-none bg-cover bg-no-repeat lg:h-auto lg:w-[272px]"
        style={{
          backgroundImage: `url(${profile.profile_image_url})`
        }}
      >
        <div
          className="absolute left-2 top-2 cursor-pointer transition-transform hover:scale-110 sm:left-4 sm:top-4"
          onClick={onToggleFavorite}
        >
          {isFavorited ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-8 text-banana sm:size-10"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-8 text-banana sm:size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-4 py-4 font-montserrat -tracking-tighter sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold lg:text-2xl">{fullName}</h3>
          <button
            onClick={() => navigate(`/profile/view/${profile.account_id}`)}
            className="rounded bg-yoda/50 px-3 py-1.5 text-sm font-semibold text-mint hover:bg-mint/50 hover:text-white"
          >
            View Profile
          </button>
        </div>
        <div className="text-sm sm:text-base lg:grid lg:grid-cols-2 lg:gap-2">
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
      <div className="flex flex-none flex-row lg:flex-col">
        <button
          onClick={() => {
            setMatchType(true);
            setIsModalVisible(true);
          }}
          disabled={isAccepted}
          className={clsx(
            'flex min-h-[60px] flex-1 flex-col items-center justify-center bg-yoda/50 px-4 py-3 text-mint lg:h-full lg:min-h-0 lg:flex-initial',
            {
              'cursor-not-allowed opacity-50': isAccepted,
              'hover:bg-mint/50 hover:text-white': !isAccepted
            }
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 lg:size-20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <span className="font-montserrat text-sm font-bold uppercase -tracking-tighter lg:text-base">
            Accept
          </span>
        </button>
        <button
          onClick={() => createMatch(false)}
          disabled={isDeclined}
          className={clsx(
            'flex min-h-[60px] flex-1 flex-col items-center justify-center bg-blush/50 px-4 py-3 text-salmon lg:h-full lg:min-h-0 lg:flex-initial',
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
            className="size-8 lg:size-20"
          >
            <path
              fillRule="evenodd"
              d="m6.72 5.66 11.62 11.62A8.25 8.25 0 0 0 6.72 5.66Zm10.56 12.68L5.66 6.72a8.25 8.25 0 0 0 11.62 11.62ZM5.105 5.106c3.807-3.808 9.98-3.808 13.788 0 3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-montserrat text-sm font-bold uppercase -tracking-tighter lg:text-base">
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
