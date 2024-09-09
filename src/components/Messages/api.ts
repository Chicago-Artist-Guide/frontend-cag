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

export const createMessageThread = async (
  firebaseStore: Firestore,
  theaterAccountId: string,
  talentAccountId: string,
  initialMessageContent: string,
  theaterOrTalent: TheaterOrTalent
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

      return existingThreadDoc.id;
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
        updated_at: Timestamp.now()
      };

      const newThreadDocRef = await addDoc(threadsRef, threadData);
      return newThreadDocRef.id;
    }
  } catch (error) {
    console.error('Error creating or updating message thread:', error);
    return false;
  }
};
