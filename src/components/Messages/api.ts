import {
  addDoc,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { TheaterOrTalent } from '../Matches/types';
import { resolveAccountIdentity } from '../Profile/shared/api';
import { stripEmailCtas, IN_APP_EMAIL_SENT_LABEL } from './messages';
import { MessageThreadType } from './types';

export const getAccountRefId = (
  ref: DocumentReference<DocumentData> | string | undefined | null
): string => (typeof ref === 'string' ? ref : ref?.id || '');

const timestampToMillis = (value: unknown): number => {
  if (!value) {
    return 0;
  }

  const withToMillis = value as { toMillis?: () => number };
  if (typeof withToMillis.toMillis === 'function') {
    return withToMillis.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const withSeconds = value as { seconds?: number };
  if (typeof withSeconds.seconds === 'number') {
    return withSeconds.seconds * 1000;
  }

  return 0;
};

// Artist Apply used to key theater_account_id as accounts/{authUid}
// while theatre-initiated threads use accounts/{accountDocId}. Collapse
// those into one sidebar row so renaming a company does not look like a
// second conversation.
export const collapseDuplicateThreads = (
  threads: MessageThreadType[],
  resolveId: (id: string) => string
): MessageThreadType[] => {
  const groups = new Map<string, MessageThreadType[]>();

  threads.forEach((thread) => {
    const theaterId = resolveId(getAccountRefId(thread.theater_account_id));
    const talentId = resolveId(getAccountRefId(thread.talent_account_id));
    const key = `${theaterId}::${talentId}`;
    const group = groups.get(key) || [];
    group.push(thread);
    groups.set(key, group);
  });

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) {
      return group[0];
    }

    const newest = [...group].sort(
      (a, b) =>
        timestampToMillis(b.updated_at) - timestampToMillis(a.updated_at)
    )[0];
    const preferred =
      group.find((thread) => {
        const storedId = getAccountRefId(thread.theater_account_id);
        return storedId === resolveId(storedId);
      }) || newest;
    const others = group.filter((thread) => thread.id !== preferred.id);
    const withProduction =
      group.find((thread) => thread.production_id) || preferred;

    return {
      ...preferred,
      last_message: newest.last_message,
      updated_at: newest.updated_at,
      production_id: preferred.production_id ?? withProduction.production_id,
      role_id: preferred.role_id ?? withProduction.role_id,
      mergedFromThreadIds: others.map((thread) => thread.id)
    };
  });
};

const uniqueIds = (...ids: Array<string | undefined>): string[] =>
  Array.from(new Set(ids.filter((id): id is string => Boolean(id))));

const findExistingThread = async (
  firebaseStore: Firestore,
  theaterIds: string[],
  talentIds: string[]
): Promise<QueryDocumentSnapshot<DocumentData> | null> => {
  const threadsRef = collection(firebaseStore, 'threads');

  for (const theaterId of theaterIds) {
    for (const talentId of talentIds) {
      const threadSnapshot = await getDocs(
        query(
          threadsRef,
          where(
            'theater_account_id',
            '==',
            doc(firebaseStore, 'accounts', theaterId)
          ),
          where(
            'talent_account_id',
            '==',
            doc(firebaseStore, 'accounts', talentId)
          )
        )
      );

      if (!threadSnapshot.empty) {
        return threadSnapshot.docs[0];
      }
    }
  }

  return null;
};

export const createMessageThread = async (
  firebaseStore: Firestore,
  theaterAccountId: string,
  talentAccountId: string,
  initialMessageContent: string,
  theaterOrTalent: TheaterOrTalent,
  productionId?: string,
  roleId?: string
) => {
  const threadsRef = collection(firebaseStore, 'threads');
  const messagesRef = collection(firebaseStore, 'messages');
  const theaterIdentity = await resolveAccountIdentity(
    firebaseStore,
    theaterAccountId
  );
  const talentIdentity = await resolveAccountIdentity(
    firebaseStore,
    talentAccountId
  );
  const resolvedTheaterId = theaterIdentity?.id || theaterAccountId;
  const resolvedTalentId = talentIdentity?.id || talentAccountId;
  const theaterAccountRef = doc(firebaseStore, 'accounts', resolvedTheaterId);
  const talentAccountRef = doc(firebaseStore, 'accounts', resolvedTalentId);

  try {
    const recipient_id =
      theaterOrTalent === 'theater' ? talentAccountRef : theaterAccountRef;
    const sender_id =
      theaterOrTalent === 'theater' ? theaterAccountRef : talentAccountRef;

    const existingThreadDoc = await findExistingThread(
      firebaseStore,
      uniqueIds(resolvedTheaterId, theaterAccountId, theaterIdentity?.uid),
      uniqueIds(resolvedTalentId, talentAccountId, talentIdentity?.uid)
    );

    // Create a new message
    const messageData = {
      content: initialMessageContent,
      recipient_id,
      sender_id,
      status: 'new',
      timestamp: Timestamp.now()
    };
    const messageDocRef = await addDoc(messagesRef, messageData);

    // we'll need to collect the threadRef to update the new message later
    let threadRef;

    // Update the existing thread's last_message
    if (existingThreadDoc) {
      const existingTheaterId = getAccountRefId(
        existingThreadDoc.data().theater_account_id
      );
      const existingTalentId = getAccountRefId(
        existingThreadDoc.data().talent_account_id
      );
      await updateDoc(existingThreadDoc.ref, {
        last_message: {
          content: initialMessageContent,
          message_id: messageDocRef,
          timestamp: Timestamp.now()
        },
        updated_at: Timestamp.now(),
        // Repair legacy uid-keyed refs so both inboxes query one thread.
        ...(existingTheaterId !== resolvedTheaterId
          ? { theater_account_id: theaterAccountRef }
          : {}),
        ...(existingTalentId !== resolvedTalentId
          ? { talent_account_id: talentAccountRef }
          : {})
      });

      threadRef = existingThreadDoc.ref;
    } else {
      // or create a new thread
      const threadData = {
        created_at: Timestamp.now(),
        last_message: {
          content: initialMessageContent,
          message_id: messageDocRef,
          timestamp: Timestamp.now()
        },
        talent_account_id: talentAccountRef,
        talent_status: 'new',
        theater_account_id: theaterAccountRef,
        theater_status: 'new',
        production_id: productionId ?? null,
        role_id: roleId ?? null,
        updated_at: Timestamp.now()
      };

      const newThreadDocRef = await addDoc(threadsRef, threadData);
      threadRef = newThreadDocRef;
    }

    // update new message with threadRef
    await updateDoc(messageDocRef, {
      thread_id: threadRef
    });

    return threadRef.id;
  } catch (error) {
    console.error('Error creating or updating message thread:', error);
    return false;
  }
};

export const appendEmailSentMessage = async (
  firebaseStore: Firestore,
  threadId: string,
  theaterAccountId: string,
  talentAccountId: string,
  theaterOrTalent: TheaterOrTalent,
  emailText: string
) => {
  const threadRef = doc(firebaseStore, 'threads', threadId);
  const messagesRef = collection(firebaseStore, 'messages');
  const theaterAccountRef = doc(firebaseStore, 'accounts', theaterAccountId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);
  const recipient_id =
    theaterOrTalent === 'theater' ? talentAccountRef : theaterAccountRef;
  const sender_id =
    theaterOrTalent === 'theater' ? theaterAccountRef : talentAccountRef;
  const content = stripEmailCtas(emailText);

  const messageDocRef = await addDoc(messagesRef, {
    content,
    recipient_id,
    sender_id,
    status: 'new',
    timestamp: Timestamp.now(),
    thread_id: threadRef,
    message_type: 'email_sent'
  });

  await updateDoc(threadRef, {
    last_message: {
      content: `${IN_APP_EMAIL_SENT_LABEL}: ${content}`,
      message_id: messageDocRef,
      timestamp: Timestamp.now()
    },
    updated_at: Timestamp.now()
  });

  return messageDocRef.id;
};

export type SendMessageThreadWithEmailParams = {
  firebaseStore: Firestore;
  theaterAccountId: string;
  talentAccountId: string;
  theaterOrTalent: TheaterOrTalent;
  shortMessage: string;
  productionId?: string;
  roleId?: string;
  email?: {
    to: string;
    subject: string;
    text: string;
    html: string;
  };
};

export const sendMessageThreadWithEmail = async ({
  firebaseStore,
  theaterAccountId,
  talentAccountId,
  theaterOrTalent,
  shortMessage,
  productionId,
  roleId,
  email
}: SendMessageThreadWithEmailParams): Promise<string | false> => {
  const theaterIdentity = await resolveAccountIdentity(
    firebaseStore,
    theaterAccountId
  );
  const talentIdentity = await resolveAccountIdentity(
    firebaseStore,
    talentAccountId
  );
  const resolvedTheaterId = theaterIdentity?.id || theaterAccountId;
  const resolvedTalentId = talentIdentity?.id || talentAccountId;

  const threadId = await createMessageThread(
    firebaseStore,
    resolvedTheaterId,
    resolvedTalentId,
    shortMessage,
    theaterOrTalent,
    productionId,
    roleId
  );

  if (!threadId || !email?.to) {
    return threadId;
  }

  await createEmail(
    firebaseStore,
    email.to,
    email.subject,
    email.text,
    email.html
  );
  await appendEmailSentMessage(
    firebaseStore,
    threadId,
    resolvedTheaterId,
    resolvedTalentId,
    theaterOrTalent,
    email.text
  );

  return threadId;
};

// DEV-382: number of threads still marked "new" for this account, used to
// surface a global unread indicator (e.g. when a theatre accepts an artist).
export const getUnreadThreadCount = async (
  firebaseStore: Firestore,
  accountId: string,
  accountType: 'company' | 'individual'
): Promise<number> => {
  if (!accountId) {
    return 0;
  }

  const accountRef = doc(firebaseStore, 'accounts', accountId);
  const threadsRef = collection(firebaseStore, 'threads');
  const isCompany = accountType === 'company';
  const threadsQuery = query(
    threadsRef,
    where(
      isCompany ? 'theater_account_id' : 'talent_account_id',
      '==',
      accountRef
    ),
    where(isCompany ? 'theater_status' : 'talent_status', '==', 'new')
  );

  const snapshot = await getDocs(threadsQuery);
  return snapshot.size;
};

export const createEmail = async (
  firebaseStore: Firestore,
  to: string,
  subject: string,
  messageText: string,
  messageHtml: string
) => {
  const messageData = {
    to: [to],
    message: {
      subject,
      text: messageText,
      html: messageHtml
    }
  };

  try {
    const mailRef = collection(firebaseStore, 'mail');
    await addDoc(mailRef, messageData);
    return true;
  } catch (error) {
    console.error('Error creating email message in Firebase', error);
    return false;
  }
};
