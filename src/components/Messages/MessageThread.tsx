import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMessages } from '../../context/MessageContext';
import { getTheaterAccountByAccountId } from '../Profile/Company/api';
import {
  getNameForAccount,
  getTheaterNameForAccount,
  getAccountWithAccountId,
  getProfileWithUid
} from '../Profile/shared/api';
import { getProduction } from '../Profile/Company/api';
import { Production, Role } from '../Profile/Company/types';
import {
  getTheaterTalentMatch,
  createTheaterTalentMatch
} from '../Matches/api';
import { TheaterTalentMatch, TheaterOrTalent } from '../Matches/types';
import { createMessageThread, createEmail } from './api';
import { MessageThreadType } from './types';
import {
  NO_EMAIL,
  UNKNOWN_ROLE,
  UNKNOWN_PRODUCTION,
  theaterToArtistMessage,
  artistToTheaterMessage,
  theaterToArtistEmailSubject,
  artistToTheaterEmailSubject,
  theaterToArtistEmailText,
  artistToTheaterEmailText,
  theaterToArtistEmailHtml,
  artistToTheaterEmailHtml
} from './messages';
import Button from '../shared/Button';

interface MessageThreadProps {
  thread: MessageThreadType;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread }) => {
  const { threadId } = useParams();
  const { account, currentUser, profile } = useUserContext();
  const { firebaseFirestore } = useFirebaseContext();
  const { loadThreadMessages, currentThreadMessages } = useMessages();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [production, setProduction] = useState<Production>();
  const [role, setRole] = useState<Role>();
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [match, setMatch] = useState<TheaterTalentMatch | null>(null);
  const [loadTrigger, setLoadTrigger] = useState<number>(0);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);

  const loadRecipientNameForThread = async (recipientId: string) => {
    const recipientName =
      account.data.type === 'company'
        ? await getNameForAccount(firebaseFirestore, recipientId)
        : await getTheaterNameForAccount(firebaseFirestore, recipientId);

    recipientName && setRecipientName(recipientName);
  };

  const loadProductionAndRoleForThread = async (
    productionId: string,
    roleId: string
  ) => {
    const productionData = await getProduction(firebaseFirestore, productionId);

    if (productionData) {
      setProduction(productionData);

      const findRole = productionData.roles?.find((r) => r.role_id === roleId);
      findRole && setRole(findRole);
    }
  };

  const loadMatch = async (
    productionId: string,
    roleId: string,
    talentId: string
  ) => {
    const findMatch = await getTheaterTalentMatch(
      firebaseFirestore,
      productionId,
      roleId,
      talentId
    );

    findMatch && setMatch(findMatch);
  };

  const sendMatchActionMessage = async (
    accountTypeForMatch: TheaterOrTalent,
    theaterId: string,
    talentId: string
  ) => {
    const messageResponse =
      accountTypeForMatch === 'theater'
        ? theaterToArtistMessage(
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            profile.data.primary_contact_email || currentUser?.email || NO_EMAIL
          )
        : artistToTheaterMessage(
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            currentUser?.email || NO_EMAIL
          );

    // calling createMessageThread should update the thread and send a new message
    await createMessageThread(
      firebaseFirestore,
      theaterId,
      talentId,
      messageResponse,
      accountTypeForMatch
    );
  };

  const sendMatchActionEmail = async (
    accountTypeForMatch: TheaterOrTalent,
    theaterId: string,
    talentId: string
  ) => {
    let toEmail = null;

    // find email address for talent or theater
    if (accountTypeForMatch === 'theater') {
      const talentAccount = await getAccountWithAccountId(
        firebaseFirestore,
        talentId
      );

      if (!talentAccount || !talentAccount?.email) {
        console.error(
          'Could not find account or account email address for talent.'
        );
        return false;
      }

      toEmail = talentAccount?.email;
    } else {
      const theaterProfile = await getProfileWithUid(
        firebaseFirestore,
        theaterId
      );

      if (!theaterProfile) {
        console.error('Could not find profile for theater');
        return false;
      }

      toEmail = theaterProfile?.primary_contact_email;

      // if there isn't a primary contact email, we need to find the account email
      if (!toEmail) {
        const theaterAccount = await getTheaterAccountByAccountId(
          firebaseFirestore,
          theaterId
        );

        if (theaterAccount && theaterAccount.email) {
          toEmail = theaterAccount.email;
        } else {
          console.log(
            'Could not find account or account email address for theater'
          );
          return false;
        }
      }
    }

    const messageEmailAddress =
      accountTypeForMatch === 'theater'
        ? profile.data.primary_contact_email || currentUser?.email || NO_EMAIL
        : currentUser?.email || NO_EMAIL;

    const emailSubject =
      accountTypeForMatch === 'theater'
        ? theaterToArtistEmailSubject(
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION
          )
        : artistToTheaterEmailSubject(
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION
          );
    const emailText =
      accountTypeForMatch === 'theater'
        ? theaterToArtistEmailText(
            recipientName || 'Talent',
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            messageEmailAddress
          )
        : artistToTheaterEmailText(
            recipientName || 'Theater',
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            messageEmailAddress
          );
    const emailHtml =
      accountTypeForMatch === 'theater'
        ? theaterToArtistEmailHtml(
            recipientName || 'Talent',
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            messageEmailAddress
          )
        : artistToTheaterEmailHtml(
            recipientName || 'Theater',
            role?.role_name || UNKNOWN_ROLE,
            production?.production_name || UNKNOWN_PRODUCTION,
            messageEmailAddress
          );

    try {
      await createEmail(
        firebaseFirestore,
        toEmail,
        emailSubject,
        emailText,
        emailHtml
      );
    } catch (error) {
      console.error('Could not send email from thread action.', error);
      return false;
    }
  };

  const updateMatch = async (status: boolean) => {
    if (!match || match === null) {
      console.error('Cannot update match. No match found.');
      return false;
    }

    const accountType = account?.data?.type || null;

    if (accountType !== 'company' && accountType !== 'individual') {
      console.error(
        'Could not properly type the current account to update match.'
      );
      return false;
    }

    const { production_id, role_id, talent_account_id } = match;
    const accountTypeForMatch: TheaterOrTalent =
      accountType === 'company' ? 'theater' : 'talent';
    const theaterId =
      typeof thread.theater_account_id === 'string'
        ? thread.theater_account_id
        : thread.theater_account_id.id;
    const talentId =
      typeof talent_account_id === 'string'
        ? talent_account_id
        : talent_account_id.id;
    const productionId =
      typeof production_id === 'string' ? production_id : production_id.id;

    try {
      // calling createTheaterTalentMatch now should UPDATE the existing match for confirmed or rejected by
      await createTheaterTalentMatch(
        firebaseFirestore,
        productionId,
        role_id,
        talentId,
        status,
        accountTypeForMatch
      );

      // if a status is positive, send messages and emails
      if (status) {
        await sendMatchActionMessage(accountTypeForMatch, theaterId, talentId);
        await sendMatchActionEmail(accountTypeForMatch, theaterId, talentId);
      }

      // trigger refresh of data, the ocky way
      setLoadTrigger((prevState) => prevState++);
    } catch (error) {
      console.error('Error updating match', error);
      return false;
    }
  };

  useEffect(() => {
    const accountIdStr = account.ref?.id || null;
    const accountType = account?.data?.type || null;

    if (!accountIdStr || !accountType) {
      return;
    }

    const theaterId =
      typeof thread.theater_account_id === 'string'
        ? thread.theater_account_id
        : thread.theater_account_id.id;
    const talentId =
      typeof thread.talent_account_id === 'string'
        ? thread.talent_account_id
        : thread.talent_account_id.id;
    const senderId = accountType === 'company' ? theaterId : talentId;
    const recipientId = accountType === 'company' ? talentId : theaterId;
    const productionId =
      typeof thread.production_id === 'string'
        ? thread.production_id
        : thread.production_id?.id;

    loadThreadMessages(senderId, recipientId, threadId);
    setAccountId(accountIdStr);
    loadRecipientNameForThread(recipientId);

    if (productionId && thread.role_id) {
      loadProductionAndRoleForThread(productionId, thread.role_id);
      loadMatch(productionId, thread.role_id, talentId);
    }

    setLoading(false);
  }, [account, thread, threadId, loadTrigger]);

  useEffect(() => {
    if (!currentThreadMessages || !currentThreadMessages.length) {
      return;
    }

    const lastMessage = currentThreadMessages.at(-1);
    const accountIdStr = account.ref?.id || null;

    if (!lastMessage || !accountIdStr || accountIdStr === null) {
      return;
    }

    const senderIdStr =
      typeof lastMessage.sender_id === 'string'
        ? lastMessage.sender_id
        : lastMessage.sender_id.id;
    const isSender = senderIdStr === accountId;

    // disable button if user is the sender of the last/most recent message
    setBtnDisabled(isSender);
  }, [currentThreadMessages]);

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3 className="m-0 text-xl font-semibold">
            Thread with {recipientName}
          </h3>
          <h4 className="m-0 mb-4">
            {role?.role_name} for {production?.production_name}
          </h4>
          <div className="space-y-4">
            {currentThreadMessages.map((msg) => {
              const senderIdStr =
                typeof msg.sender_id === 'string'
                  ? msg.sender_id
                  : msg.sender_id.id;
              const isSender = senderIdStr === accountId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      isSender
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-800 bg-lighterGrey'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
          {match && (
            <div className="mt-4 flex justify-end space-x-4 border-t border-stone-200 pt-4">
              {match.confirmed_by || match.rejected_by ? (
                <p>
                  <strong>Match Status:</strong>{' '}
                  {match.confirmed_by && <>accepted by {match.confirmed_by}</>}{' '}
                  {match.rejected_by && <>declined by {match.rejected_by}</>}
                  <br />
                  <em className="text-xs">
                    Please check your email for further updates.
                  </em>
                </p>
              ) : (
                <>
                  <Button
                    onClick={() => updateMatch(false)}
                    text="Decline Match"
                    variant="danger"
                    disabled={btnDisabled}
                  />
                  <Button
                    onClick={() => updateMatch(true)}
                    text="Accept Match"
                    variant="primary"
                    disabled={btnDisabled}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
