"use strict";
/**
 * Automated e-sign reminder scheduler
 * Runs every 6 hours — checks all 'sent' documents and sends:
 *   • 24h reminder  — if signer hasn't signed 24h after invite
 *   • 3-day reminder — recurring every 3 days after that
 *   • Expiry warning — 48h before document expires
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.esignReminder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const esignRoutes_1 = require("./esignRoutes");
const FIRST_REMINDER_MS = 24 * 60 * 60 * 1000;
const EXPIRY_WARN_MS = 2 * 24 * 60 * 60 * 1000;
const REMINDER_INTERVALS = {
    daily: 1 * 24 * 60 * 60 * 1000,
    '3days': 3 * 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    none: Infinity,
};
exports.esignReminder = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('UTC')
    .onRun(async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const db = admin.firestore();
    const now = Date.now();
    const snap = await db.collection('sign_documents')
        .where('status', '==', 'sent')
        .get();
    functions.logger.info(`esignReminder: checking ${snap.size} sent documents`);
    const updates = [];
    for (const docSnap of snap.docs) {
        const doc = docSnap.data();
        const docId = docSnap.id;
        const expiry = ((_a = doc.expiresAt) === null || _a === void 0 ? void 0 : _a.seconds) ? doc.expiresAt.seconds * 1000 : null;
        const recurringInterval = (_c = REMINDER_INTERVALS[(_b = doc.reminderFrequency) !== null && _b !== void 0 ? _b : '3days']) !== null && _c !== void 0 ? _c : REMINDER_INTERVALS['3days'];
        // Skip expired documents
        if (expiry && now > expiry)
            continue;
        const signers = (_d = doc.signers) !== null && _d !== void 0 ? _d : [];
        const updatedSigners = [...signers];
        let needsUpdate = false;
        for (let i = 0; i < signers.length; i++) {
            const signer = signers[i];
            if (signer.status !== 'pending' && signer.status !== 'viewed')
                continue;
            const invitedAt = (_e = signer.invitedAt) !== null && _e !== void 0 ? _e : 0;
            const lastReminder = (_f = signer.lastReminderAt) !== null && _f !== void 0 ? _f : invitedAt;
            const reminderCount = (_g = signer.reminderCount) !== null && _g !== void 0 ? _g : 0;
            const elapsed = now - (lastReminder || invitedAt);
            const totalElapsed = now - invitedAt;
            // Determine if a reminder is due
            const isFirstReminderDue = reminderCount === 0 && totalElapsed >= FIRST_REMINDER_MS;
            const isRecurringDue = reminderCount > 0 && elapsed >= recurringInterval;
            const isExpiryWarningDue = expiry && !signer.expiryWarningSent && (expiry - now) <= EXPIRY_WARN_MS && (expiry - now) > 0;
            if (isExpiryWarningDue && expiry) {
                functions.logger.info(`esignReminder: expiry warning → ${signer.email} for doc ${docId}`);
                updates.push((0, esignRoutes_1.sendMail)(signer.email, `⏳ Your signing link expires soon — "${doc.title}"`, (0, esignRoutes_1.buildExpiryWarningEmail)({
                    signerName: signer.name,
                    ownerName: doc.ownerName,
                    docTitle: doc.title,
                    docPages: (_h = doc.pageCount) !== null && _h !== void 0 ? _h : 1,
                    signingOrder: doc.signingOrder,
                    link: `https://pdfa2z.com/sign/${signer.token}`,
                    expiresAt: new Date(expiry),
                })).catch(e => functions.logger.error('expiry warning mail failed', e)));
                updatedSigners[i] = Object.assign(Object.assign({}, signer), { expiryWarningSent: true });
                needsUpdate = true;
            }
            if (isFirstReminderDue || isRecurringDue) {
                const count = reminderCount + 1;
                functions.logger.info(`esignReminder: reminder #${count} → ${signer.email} for doc ${docId}`);
                updates.push((0, esignRoutes_1.sendMail)(signer.email, count === 1
                    ? `Reminder: please sign "${doc.title}"`
                    : `Reminder #${count}: "${doc.title}" is still awaiting your signature`, (0, esignRoutes_1.buildReminderEmail)({
                    signerName: signer.name,
                    ownerName: doc.ownerName,
                    docTitle: doc.title,
                    docPages: (_j = doc.pageCount) !== null && _j !== void 0 ? _j : 1,
                    signingOrder: doc.signingOrder,
                    link: `https://pdfa2z.com/sign/${signer.token}`,
                    reminderCount: count,
                    expiresAt: expiry ? new Date(expiry) : undefined,
                })).catch(e => functions.logger.error('reminder mail failed', e)));
                updatedSigners[i] = Object.assign(Object.assign({}, signer), { lastReminderAt: now, reminderCount: count });
                needsUpdate = true;
            }
        }
        if (needsUpdate) {
            updates.push(db.collection('sign_documents').doc(docId).update({ signers: updatedSigners }));
        }
    }
    await Promise.allSettled(updates);
    functions.logger.info(`esignReminder: done — ${updates.length} actions`);
});
//# sourceMappingURL=esignScheduler.js.map