import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { TheaterOrTalent } from '../Matches/types';
import { stripEmailCtas, IN_APP_EMAIL_SENT_LABEL } from './messages';

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
  const theaterAccountRef = doc(firebaseStore, 'accounts', theaterAccountId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);

  try {
    const recipient_id =
      theaterOrTalent === 'theater' ? talentAccountRef : theaterAccountRef;
    const sender_id =
      theaterOrTalent === 'theater' ? theaterAccountRef : talentAccountRef;

    // Check if a thread already exists
    const threadQuery = query(
      threadsRef,
      where('theater_account_id', '==', theaterAccountRef),
      where('talent_account_id', '==', talentAccountRef)
    );
    const threadSnapshot = await getDocs(threadQuery);

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
    if (!threadSnapshot.empty) {
      const existingThreadDoc = threadSnapshot.docs[0];
      await updateDoc(existingThreadDoc.ref, {
        last_message: {
          content: initialMessageContent,
          message_id: messageDocRef,
          timestamp: Timestamp.now()
        },
        updated_at: Timestamp.now()
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
  const threadId = await createMessageThread(
    firebaseStore,
    theaterAccountId,
    talentAccountId,
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
    theaterAccountId,
    talentAccountId,
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
