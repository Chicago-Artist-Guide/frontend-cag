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

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPay = () => {
    if (!role.role_rate) return null;
    const rate = `$${role.role_rate}`;
    const unit = role.role_rate_unit ? ` ${role.role_rate_unit}` : '';
    return `${rate}${unit}`;
  };

  const getAuditionDates = () => {
    const start = formatDate(production?.audition_start);
    const end = formatDate(production?.audition_end);
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return null;
  };

  return (
    <div
      className={clsx('flex min-h-[272px] max-w-[812px] flex-col lg:flex-row', {
        'border-4 border-mint bg-yoda/25': isAccepted,
        'border-4 border-salmon bg-blush/25': isDeclined
      })}
    >
      {production?.production_image_url && (
        <div
          className="relative h-64 w-full flex-none bg-cover bg-center bg-no-repeat lg:h-auto lg:w-[200px]"
          style={{
            backgroundImage: `url(${production.production_image_url})`
          }}
        />
      )}
      <div className="relative flex flex-1 flex-col overflow-hidden px-4 py-4 font-montserrat -tracking-tighter sm:px-8">
        <h2 className="mb-2 text-xl font-bold lg:text-2xl">{role.role_name}</h2>
        {production?.production_name && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/shows/${production.production_id}`)}
              className="text-left text-base font-semibold text-cornflower hover:underline"
            >
              {production.production_name}
            </button>
            {theater?.theatre_name && (
              <>
                {' by '}
                <button
                  onClick={() =>
                    navigate(`/profile/view/${theater.account_id}`)
                  }
                  className="text-base font-semibold text-cornflower hover:underline"
                >
                  {theater.theatre_name}
                </button>
              </>
            )}
          </div>
        )}
        <div className="text-sm sm:text-base lg:grid lg:grid-cols-2 lg:gap-2">
          {getAuditionDates() && (
            <>
              <div>Audition Dates</div>
              <div className="font-semibold">{getAuditionDates()}</div>
            </>
          )}
          {production?.location && (
            <>
              <div>Venue</div>
              <div className="font-semibold">{production.location}</div>
            </>
          )}
          {formatPay() && (
            <>
              <div>Pay</div>
              <div className="font-semibold">{formatPay()}</div>
            </>
          )}
        </div>
        {role.description && (
          <p className="mt-3 text-sm text-stone-600">{role.description}</p>
        )}
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
