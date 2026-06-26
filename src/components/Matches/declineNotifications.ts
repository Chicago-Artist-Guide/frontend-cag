import { Firestore } from 'firebase/firestore';
import { Production } from '../Profile/Company/types';
import {
  getDeclinedMatchesForProduction,
  markMatchDeclineNotified
} from './api';
import { createEmail, createMessageThread } from '../Messages/api';
import { getAccountWithAccountId } from '../Profile/shared/api';
import {
  UNKNOWN_ROLE,
  theaterDeclineArtistMessage,
  theaterDeclineArtistEmailSubject,
  theaterDeclineArtistEmailText,
  theaterDeclineArtistEmailHtml
} from '../Messages/messages';

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
      const account = await getAccountWithAccountId(
        firebaseStore,
        talentAccountId
      );

      if (account && account.email) {
        await createEmail(
          firebaseStore,
          account.email,
          theaterDeclineArtistEmailSubject(
            roleName,
            production.production_name
          ),
          theaterDeclineArtistEmailText(
            theaterName,
            roleName,
            production.production_name
          ),
          theaterDeclineArtistEmailHtml(
            theaterName,
            roleName,
            production.production_name
          )
        );
      }

      await createMessageThread(
        firebaseStore,
        theaterAccountId,
        talentAccountId,
        theaterDeclineArtistMessage(roleName, production.production_name),
        'theater',
        production.production_id,
        match.role_id
      );

      await markMatchDeclineNotified(firebaseStore, match.id);
      notified++;
    } catch (error) {
      console.error(error);
      continue;
    }
  }

  return notified;
};
