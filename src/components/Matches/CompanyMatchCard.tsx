import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Swal from 'sweetalert2';
import { useUserContext } from '../../context/UserContext';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import {
  getTheaterByAccountUid,
  getTheaterAccountByAccountId
} from '../Profile/Company/api';
import { Profile, Production } from '../Profile/Company/types';
import { createMessageThread, createEmail } from '../Messages/api';
import {
  UNKNOWN_ROLE,
  NO_EMAIL,
  artistToTheaterMessage,
  artistToTheaterEmailSubject,
  artistToTheaterEmailText,
  artistToTheaterEmailHtml
} from '../Messages/messages';
import { MatchConfirmationModal } from './MatchConfirmationModal';
import { ProductionRole } from './types';
import { createTheaterTalentMatch, getTheaterTalentMatch } from './api';

export const CompanyMatchCard = ({ role }: { role: ProductionRole }) => {
  const navigate = useNavigate();
  const { account, currentUser } = useUserContext();
  const { findProduction } = useRoleMatches();
  const { firebaseFirestore } = useFirebaseContext();
  const [production, setProduction] = useState<Production | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchType, setMatchType] = useState<boolean | null>(null);
  const [matchStatus, setMatchStatus] = useState<boolean | null>(null);
  const [theater, setTheater] = useState<Profile | null>(null);
  const productionName = production?.production_name || '(Unknown Production)';
  const roleName = role.role_name;
  const isDeclined = matchStatus === false;
  const isAccepted = matchStatus === true;

  const findMatch = async () => {
    const productionId = production?.production_id || '';
    const roleId = role.role_id || '';
    const talentAccountId = account.ref?.id;

    if (!talentAccountId) {
      console.error('Cannot find current user account ref');
      return false;
    }

    const foundMatch = await getTheaterTalentMatch(
      firebaseFirestore,
      productionId,
      roleId,
      talentAccountId,
      'talent'
    );

    if (foundMatch) {
      const matchStatus = foundMatch.status;
      setMatchStatus(matchStatus);
    }
  };

  const findTheater = async () => {
    if (!production || production === null) {
      return false;
    }

    const theaterAccountId = production?.account_id || '';

    if (!theaterAccountId || theaterAccountId == '') {
      console.error('Could not find theater account id');
      return false;
    }

    const getTheater = await getTheaterByAccountUid(
      firebaseFirestore,
      theaterAccountId
    );

    if (!getTheater) {
      console.error('Could not find theater profile');
      return false;
    }

    setTheater(getTheater);
  };

  const sendEmailToTheater = async () => {
    if (!theater || theater === null) {
      console.error('Could not find theater to send email');
      return false;
    }

    const subject = artistToTheaterEmailSubject(
      roleName || UNKNOWN_ROLE,
      productionName
    );
    const messageContent = artistToTheaterEmailText(
      `${account?.data.first_name} ${account?.data.last_name}`,
      roleName || UNKNOWN_ROLE,
      productionName,
      currentUser?.email || NO_EMAIL
    );
    const messageContentHtml = artistToTheaterEmailHtml(
      `${account?.data.first_name} ${account?.data.last_name}`,
      roleName || UNKNOWN_ROLE,
      productionName,
      currentUser?.email || NO_EMAIL
    );
    let toEmail = theater?.primary_contact_email;

    // if there isn't a primary contact email, we need to find the account email
    if (!toEmail) {
      const theaterAccount = await getTheaterAccountByAccountId(
        firebaseFirestore,
        theater.account_id
      );

      if (theaterAccount && theaterAccount.email) {
        toEmail = theaterAccount.email;
      }
    }

    toEmail &&
      (await createEmail(
        firebaseFirestore,
        toEmail,
        subject,
        messageContent,
        messageContentHtml
      ));
  };

  const createMatch = async (status: boolean) => {
    try {
      const productionId = production?.production_id || '';
      const roleId = role.role_id || '';
      const talentAccountId = account.ref?.id;
      const theaterAccountId = production?.account_id || '';

      if (!talentAccountId) {
        console.error('Cannot find current user account ref');
        return false;
      }

      await createTheaterTalentMatch(
        firebaseFirestore,
        productionId,
        roleId,
        talentAccountId,
        status,
        'talent'
      );

      // update match state in this card
      await findMatch();

      // only create messages and emails if accepted
      if (status) {
        const messageContent = artistToTheaterMessage(
          roleName || UNKNOWN_ROLE,
          productionName,
          currentUser?.email || NO_EMAIL
        );
        const messageThreadId = await createMessageThread(
          firebaseFirestore,
          theaterAccountId,
          talentAccountId,
          messageContent,
          'talent',
          productionId,
          roleId
        );

        // send email
        await sendEmailToTheater();

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

  useEffect(() => {
    findProduction(role.productionId).then((p) => setProduction(p));
  }, [role]);

  useEffect(() => {
    if (!production) {
      return;
    }

    const productionChangeOrder = async () => {
      await findMatch();
      await findTheater();
    };

    productionChangeOrder();
  }, [production]);

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
      Please confirm you would like to express interest in the following role:
      <span className="mx-2 my-8 block rounded-xl bg-stone-200 px-4 py-2">
        <strong>{roleName}</strong> in <em>{productionName}</em>
      </span>
      Once you click Confirm, a new message thread will be created with the
      theater company.
    </>
  );

  return (
    <div
      className={clsx('flex min-h-[272px] max-w-[812px]', {
        'border-4 border-mint bg-yoda/25': isAccepted,
        'border-4 border-salmon bg-blush/25': isDeclined
      })}
    >
      <div className="relative flex flex-1 flex-col overflow-hidden px-8 py-4 font-montserrat -tracking-tighter">
        <h2 className="mb-4 text-2xl font-bold">{role.role_name}</h2>
        {production?.production_name && (
          <h3 className="-mt-2 mb-2 grid grid-cols-2 gap-2 text-base font-bold">
            {production.production_name} by {theater?.theatre_name}
          </h3>
        )}
        <div className="text-base xl:grid xl:grid-cols-2 xl:gap-2">
          <div>Type</div>
          <div className="font-semibold">{role.type}</div>
          <div>Ethnicity</div>
          <div className="font-semibold">
            {role.ethnicity?.join(', ') || 'N/A'}
          </div>
          <div>Age Range</div>
          <div className="font-semibold">
            {role.age_range?.join(', ') || 'N/A'}
          </div>
          <div>Gender</div>
          <div className="font-semibold">
            {role.gender_identity?.join(', ') || 'N/A'}
          </div>
        </div>
        {role.description && (
          <h4 className="my-2 text-base">{role.description}</h4>
        )}
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
