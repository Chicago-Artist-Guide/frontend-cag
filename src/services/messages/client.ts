import 'client-only';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { getFirebaseClient } from '../../lib/firebase/client';

export type MessageAccountType = 'company' | 'individual';

export const getUnreadThreadCount = async (
  accountId: string,
  accountType: MessageAccountType
): Promise<number> => {
  if (!accountId) {
    return 0;
  }

  const { firestore } = getFirebaseClient();
  const accountReference = doc(firestore, 'accounts', accountId);
  const threadsReference = collection(firestore, 'threads');
  const isCompany = accountType === 'company';
  const threadsQuery = query(
    threadsReference,
    where(
      isCompany ? 'theater_account_id' : 'talent_account_id',
      '==',
      accountReference
    ),
    where(isCompany ? 'theater_status' : 'talent_status', '==', 'new')
  );
  const snapshot = await getDocs(threadsQuery);

  return snapshot.size;
};
