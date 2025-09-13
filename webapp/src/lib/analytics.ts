import { firestoreAdmin as firestore } from '@/lib/firebase-admin';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

/**
 * Logs sent SMS messages to Firestore.
 * @param businessId The ID of the business that sent the messages.
 * @param results The results from Promise.allSettled on the Twilio message creation promises.
 */
export async function logSMS(businessId: string, results: PromiseSettledResult<MessageInstance>[]) {
  const batch = firestore.batch();
  const messagesRef = firestore.collection('messages');
  let successfulSends = 0;

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const messageInstance = result.value;
      const docRef = messagesRef.doc();
      batch.set(docRef, {
        businessId: businessId,
        sent_at: new Date(),
        status: messageInstance.status, // 'queued', 'sending', 'sent', etc.
        messageSid: messageInstance.sid,
        direction: 'outgoing'
      });
      successfulSends++;
    }
  });

  await batch.commit();
  return successfulSends;
}
