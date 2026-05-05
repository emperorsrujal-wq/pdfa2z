/**
 * Automated e-sign reminder scheduler
 * Runs every 6 hours — checks all 'sent' documents and sends:
 *   • 24h reminder  — if signer hasn't signed 24h after invite
 *   • 3-day reminder — recurring every 3 days after that
 *   • Expiry warning — 48h before document expires
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendMail, buildReminderEmail, buildExpiryWarningEmail } from './esignRoutes';

const FIRST_REMINDER_MS  = 24 * 60 * 60 * 1000;     // 24 hours
const RECURRING_INTERVAL = 3  * 24 * 60 * 60 * 1000; // 3 days
const EXPIRY_WARN_MS     = 2  * 24 * 60 * 60 * 1000; // 48 hours before expiry

export const esignReminder = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();
    const now = Date.now();

    const snap = await db.collection('sign_documents')
      .where('status', '==', 'sent')
      .get();

    functions.logger.info(`esignReminder: checking ${snap.size} sent documents`);

    const updates: Promise<any>[] = [];

    for (const docSnap of snap.docs) {
      const doc = docSnap.data();
      const docId = docSnap.id;
      const expiry: number | null = doc.expiresAt?.seconds ? doc.expiresAt.seconds * 1000 : null;

      // Skip expired documents
      if (expiry && now > expiry) continue;

      const signers: any[] = doc.signers ?? [];
      const updatedSigners = [...signers];
      let needsUpdate = false;

      for (let i = 0; i < signers.length; i++) {
        const signer = signers[i];
        if (signer.status !== 'pending' && signer.status !== 'viewed') continue;

        const invitedAt: number = signer.invitedAt ?? 0;
        const lastReminder: number = signer.lastReminderAt ?? invitedAt;
        const reminderCount: number = signer.reminderCount ?? 0;
        const elapsed = now - (lastReminder || invitedAt);
        const totalElapsed = now - invitedAt;

        // Determine if a reminder is due
        const isFirstReminderDue = reminderCount === 0 && totalElapsed >= FIRST_REMINDER_MS;
        const isRecurringDue     = reminderCount > 0  && elapsed >= RECURRING_INTERVAL;
        const isExpiryWarningDue = expiry && !signer.expiryWarningSent && (expiry - now) <= EXPIRY_WARN_MS && (expiry - now) > 0;

        if (isExpiryWarningDue && expiry) {
          functions.logger.info(`esignReminder: expiry warning → ${signer.email} for doc ${docId}`);
          updates.push(
            sendMail(
              signer.email,
              `⏳ Your signing link expires soon — "${doc.title}"`,
              buildExpiryWarningEmail({
                signerName: signer.name,
                ownerName: doc.ownerName,
                docTitle: doc.title,
                docPages: doc.pageCount ?? 1,
                signingOrder: doc.signingOrder,
                link: `https://pdfa2z.com/sign/${signer.token}`,
                expiresAt: new Date(expiry),
              }),
            ).catch(e => functions.logger.error('expiry warning mail failed', e))
          );
          updatedSigners[i] = { ...signer, expiryWarningSent: true };
          needsUpdate = true;
        }

        if (isFirstReminderDue || isRecurringDue) {
          const count = reminderCount + 1;
          functions.logger.info(`esignReminder: reminder #${count} → ${signer.email} for doc ${docId}`);
          updates.push(
            sendMail(
              signer.email,
              count === 1
                ? `Reminder: please sign "${doc.title}"`
                : `Reminder #${count}: "${doc.title}" is still awaiting your signature`,
              buildReminderEmail({
                signerName: signer.name,
                ownerName: doc.ownerName,
                docTitle: doc.title,
                docPages: doc.pageCount ?? 1,
                signingOrder: doc.signingOrder,
                link: `https://pdfa2z.com/sign/${signer.token}`,
                reminderCount: count,
                expiresAt: expiry ? new Date(expiry) : undefined,
              }),
            ).catch(e => functions.logger.error('reminder mail failed', e))
          );
          updatedSigners[i] = { ...signer, lastReminderAt: now, reminderCount: count };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        updates.push(
          db.collection('sign_documents').doc(docId).update({ signers: updatedSigners })
        );
      }
    }

    await Promise.allSettled(updates);
    functions.logger.info(`esignReminder: done — ${updates.length} actions`);
  });
