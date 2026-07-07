import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Swal from 'sweetalert2';
import { useUserContext } from '../../context/UserContext';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import {
  getTheaterAccountByAccountId,
  getTheaterAccountByUid,
  getTheaterByAccountId
} from '../Profile/Company/api';
import { Profile, Production } from '../Profile/Company/types';
import { sendMessageThreadWithEmail } from '../Messages/api';
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

export const CompanyMatchCard = ({
  role,
  isFavorite = false,
  onToggleFavorite,
  matchStatus: matchStatusProp,
  onMatchStatusChange
}: {
  role: ProductionRole;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  matchStatus?: boolean | null;
  onMatchStatusChange?: (status: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { account, currentUser } = useUserContext();
  const { findProduction } = useRoleMatches();
  const { firebaseFirestore } = useFirebaseContext();
  const [production, setProduction] = useState<Production | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchType, setMatchType] = useState<boolean | null>(null);
  const [localMatchStatus, setLocalMatchStatus] = useState<boolean | null>(
    null
  );
  const matchStatus =
    matchStatusProp !== undefined ? matchStatusProp : localMatchStatus;
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

    setLocalMatchStatus(foundMatch ? foundMatch.status : null);
  };

  const findTheater = async () => {
    if (!production || production === null) {
      return false;
    }

    const theaterAccountUid = production?.account_id || '';

    if (!theaterAccountUid || theaterAccountUid == '') {
      console.error('Could not find theater account id');
      return false;
    }

    // production.account_id is the company auth uid. Resolve account first so
    // we can fall back from profile.theatre_name to account.theater_name when
    // the company hasn't completed their detailed profile yet.
    const theaterAccount = await getTheaterAccountByUid(
      firebaseFirestore,
      theaterAccountUid
    );

    if (!theaterAccount) {
      console.error('Could not find theater account by uid');
      return false;
    }

    const theaterProfile = await getTheaterByAccountId(
      firebaseFirestore,
      theaterAccount.id
    );

    if (!theaterProfile) {
      console.error('Could not find theater profile');
      return false;
    }

    if (!theaterProfile.theatre_name && (theaterAccount as any).theater_name) {
      theaterProfile.theatre_name = (theaterAccount as any).theater_name;
    }

    setTheater(theaterProfile);
  };

  const sendApplyNotifications = async (
    theaterAccountId: string,
    talentAccountId: string
  ) => {
    const contactEmail = currentUser?.email || NO_EMAIL;
    const talentFullName = `${account?.data.first_name} ${account?.data.last_name}`;
    const shortMessage = artistToTheaterMessage(
      roleName || UNKNOWN_ROLE,
      productionName,
      contactEmail
    );
    const emailText = artistToTheaterEmailText(
      talentFullName,
      roleName || UNKNOWN_ROLE,
      productionName,
      contactEmail
    );
    const emailHtml = artistToTheaterEmailHtml(
      talentFullName,
      roleName || UNKNOWN_ROLE,
      productionName,
      contactEmail
    );

    let toEmail = theater?.primary_contact_email;

    if (!toEmail) {
      const theaterAccount = await getTheaterAccountByAccountId(
        firebaseFirestore,
        theater.account_id
      );

      if (theaterAccount?.email) {
        toEmail = theaterAccount.email;
      }
    }

    return sendMessageThreadWithEmail({
      firebaseStore: firebaseFirestore,
      theaterAccountId,
      talentAccountId,
      theaterOrTalent: 'talent',
      shortMessage,
      productionId: production?.production_id,
      roleId: role.role_id,
      email: toEmail
        ? {
            to: toEmail,
            subject: artistToTheaterEmailSubject(
              roleName || UNKNOWN_ROLE,
              productionName
            ),
            text: emailText,
            html: emailHtml
          }
        : undefined
    });
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

      onMatchStatusChange?.(status);
      if (matchStatusProp === undefined) {
        await findMatch();
      }

      // only create messages and emails if accepted
      if (status) {
        if (!theater) {
          console.error('Could not find theater to send notifications');
          return false;
        }

        const messageThreadId = await sendApplyNotifications(
          theaterAccountId,
          talentAccountId
        );

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
      if (matchStatusProp === undefined) {
        await findMatch();
      }
      await findTheater();
    };

    productionChangeOrder();
  }, [production, matchStatusProp]);

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
      Please confirm you would like to apply for the following role:
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

  const getProductionDates = () => {
    const start = formatDate(production?.open_and_close_start);
    const end = formatDate(production?.open_and_close_end);
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
      {production?.production_image_url ? (
        <div
          className="relative h-64 w-full flex-none bg-cover bg-center bg-no-repeat lg:h-auto lg:w-[200px]"
          style={{
            backgroundImage: `url(${production.production_image_url})`
          }}
        />
      ) : (
        <div className="relative flex h-64 w-full flex-none items-center justify-center bg-stone-200 lg:h-auto lg:w-[200px]">
          <span className="font-montserrat text-sm text-stone-400">
            No Image
          </span>
        </div>
      )}
      <div className="relative flex flex-1 flex-col overflow-hidden px-4 py-4 font-montserrat -tracking-tighter sm:px-8">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Unfavorite role' : 'Favorite role'}
            className={clsx(
              'absolute right-3 top-3 rounded-full p-1 transition-colors',
              {
                'text-banana hover:text-banana/80': isFavorite,
                'text-stone-300 hover:text-banana': !isFavorite
              }
            )}
          >
            {isFavorite ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
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
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            )}
          </button>
        )}
        <h2 className="mb-2 text-xl font-bold lg:text-2xl">{role.role_name}</h2>
        {production?.production_name && (
          <div className="mb-4">
            <button
              onClick={() =>
                navigate(`/shows/${production.production_id}?tab=basic`)
              }
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
          {getProductionDates() && (
            <>
              <div>Production Dates</div>
              <div className="font-semibold">{getProductionDates()}</div>
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
        {role.type === 'On-Stage' && production && (
          <button
            onClick={() =>
              navigate(`/shows/${production.production_id}?tab=audition`)
            }
            className="mt-3 w-fit rounded bg-cornflower/50 px-4 py-2 text-sm font-semibold text-cornflower hover:bg-cornflower hover:text-white"
          >
            Onstage Audition Info
          </button>
        )}
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
            Apply
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
            Hide
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
