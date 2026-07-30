import { Firestore } from 'firebase/firestore';
import { Production } from '../Profile/Company/types';
import {
  getDeclinedAppliedMatchesForRole,
  getDeclinedMatchesForProduction,
  markMatchDeclineNotified
} from './api';
import {
  createMessageThread,
  sendMessageThreadWithEmail
} from '../Messages/api';
import { getAccountByIdOrUid } from '../../services/accounts/client';
import {
  UNKNOWN_ROLE,
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailSubject,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml
} from '../Messages/messages';
import { TheaterTalentMatch } from './types';

const notifyDeclinedMatches = async (
  firebaseStore: Firestore,
  matches: TheaterTalentMatch[],
  production: Production,
  theaterAccountId: string,
  theaterName: string
): Promise<number> => {
  let notified = 0;

  for (const match of matches) {
    try {
      const roleName =
        production.roles?.find((r) => r.role_id === match.role_id)?.role_name ||
        UNKNOWN_ROLE;
      const talentAccountId =
        typeof match.talent_account_id === 'string'
          ? match.talent_account_id
          : match.talent_account_id.id;
      const account = await getAccountByIdOrUid(talentAccountId);
      const accountEmail = account?.data.email;
      const shortMessage = theaterDeclineArtistMessage(roleName, theaterName);
      const emailText = theaterDeclineArtistEmailText(theaterName, roleName);

      if (accountEmail) {
        await sendMessageThreadWithEmail({
          firebaseStore,
          theaterAccountId,
          talentAccountId,
          theaterOrTalent: 'theater',
          shortMessage,
          productionId: production.production_id,
          roleId: match.role_id,
          email: {
            to: accountEmail,
            subject: theaterDeclineArtistEmailSubject(
              roleName,
              production.production_name
            ),
            text: emailText,
            html: theaterDeclineArtistEmailHtml(theaterName, roleName)
          }
        });
      } else {
        await createMessageThread(
          firebaseStore,
          theaterAccountId,
          talentAccountId,
          shortMessage,
          'theater',
          production.production_id,
          match.role_id
        );
      }

      await markMatchDeclineNotified(firebaseStore, match.id);
      notified++;
    } catch (error) {
      console.error(error);
      continue;
    }
  }

  return notified;
};

export const sendDeferredDeclineNotifications = async (
  firebaseStore: Firestore,
  production: Production,
  theaterAccountId: string,
  theaterName: string
): Promise<number> => {
  const matches = await getDeclinedMatchesForProduction(
    firebaseStore,
    production.production_id
  );

  return notifyDeclinedMatches(
    firebaseStore,
    matches,
    production,
    theaterAccountId,
    theaterName
  );
};

export const sendRoleCloseDeclineNotifications = async (
  firebaseStore: Firestore,
  production: Production,
  roleId: string,
  theaterAccountId: string,
  theaterName: string
): Promise<number> => {
  const matches = await getDeclinedAppliedMatchesForRole(
    firebaseStore,
    production.production_id,
    roleId
  );

  return notifyDeclinedMatches(
    firebaseStore,
    matches,
    production,
    theaterAccountId,
    theaterName
  );
};
