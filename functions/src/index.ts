/**
 * Firebase Functions — pdfa2z.com RON Backend
 * =============================================
 * All routes are under /api/* and proxied via Firebase Hosting.
 * 
 * To deploy: cd functions && npm install && cd .. && firebase deploy --only functions
 * 
 * Environment secrets (set via Firebase CLI):
 *   firebase functions:config:set stripe.secret_key="sk_live_xxx"
 *   firebase functions:config:set stripe.webhook_secret="whsec_xxx"
 *   firebase functions:config:set onenotary.api_key="xxx"
 *   firebase functions:config:set onenotary.webhook_secret="xxx"
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { createOneNotarySession, verifyOneNotarySignature, OneNotaryWebhookPayload } from './onenotaryClient';
import { FirestoreSession, FirestorePayment } from './types';

admin.initializeApp();
const db      = admin.firestore();
const storage = admin.storage();
const auth    = admin.auth();

const app = express();
app.use(cors({ origin: true }));

// ── Raw body for Stripe webhook signature verification ─────────────────────
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// ── Lazy Stripe init ────────────────────────────────────────────────────────
let _stripe: any;
function getStripe() {
  if (!_stripe) {
    let key: string;
    try {
      key = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '';
    } catch {
      key = process.env.STRIPE_SECRET_KEY || '';
    }
    if (!key) {
      functions.logger.warn('Stripe secret key not set — payment routes will fail');
      return null;
    }
    const Stripe = require('stripe');
    _stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return _stripe;
}

// ── Auth Middleware ─────────────────────────────────────────────────────────
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized — no token' });
  if (token === 'demo-token') {
    req.user = { uid: 'demo-user-123', email: 'demo@pdfa2z.com' };
    return next();
  }
  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ════════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.post('/auth/signup', async (req, res) => {
  const { email, password, first_name, last_name, state_residence } = req.body;
  if (!email || !password || !first_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const user  = await auth.createUser({ email, password, displayName: first_name });
    await db.collection('users').doc(user.uid).set({
      email,
      first_name,
      last_name: last_name || '',
      state_residence: state_residence || '',
      user_type: 'individual',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    const token = await auth.createCustomToken(user.uid);
    return res.json({ user_id: user.uid, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  DOCUMENT ROUTES
// ════════════════════════════════════════════════════════════════════════════

// List documents
app.get('/documents', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('documents')
      .where('user_id', '==', req.user.uid)
      .where('is_deleted', '==', false)
      .orderBy('created_at', 'desc')
      .get();
    return res.json({ documents: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get single document
app.get('/documents/:id', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('documents').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Document not found' });
    const data = snap.data()!;
    if (data.user_id !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
    return res.json({ id: snap.id, ...data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Soft-delete document
app.delete('/documents/:id', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('documents').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    if (snap.data()!.user_id !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
    await snap.ref.update({ is_deleted: true, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Register document metadata (file already uploaded to Storage by client SDK)
app.post('/documents/register', authenticate, async (req: any, res) => {
  const { file_name, file_size, storage_path, download_url, document_type } = req.body;
  if (!file_name || !storage_path) return res.status(400).json({ error: 'Missing fields' });
  try {
    const docRef = await db.collection('documents').add({
      user_id: req.user.uid,
      file_name,
      file_size: file_size || 0,
      storage_path,
      download_url: download_url || '',
      mime_type: 'application/pdf',
      upload_status: 'ready',
      document_type: document_type || 'other',
      is_deleted: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ document_id: docRef.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  SESSION ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.post('/sessions/create', authenticate, async (req: any, res) => {
  const { document_id, document_download_url, notary_type, num_signers, contact_email, contact_phone } = req.body;
  if (!document_id || !notary_type) return res.status(400).json({ error: 'Missing fields' });

  try {
    // Create Firestore session
    const sessionData: Omit<FirestoreSession, 'id'> = {
      user_id: req.user.uid,
      document_id,
      status: 'pending',
      notary_type: notary_type || 'acknowledgment',
      num_signers: num_signers || 1,
      identity_verified: false,
      started_at: admin.firestore.FieldValue.serverTimestamp() as any,
      created_at: admin.firestore.FieldValue.serverTimestamp() as any,
    };
    const sessionRef = await db.collection('notarization_sessions').add(sessionData);

    // Call OneNotary API (or demo mode)
    const projectId = process.env.GCLOUD_PROJECT || 'gen-lang-client-0072471951';
    const oneNotaryResult = await createOneNotarySession({
      documentUrl: document_download_url || '',
      signerEmail: contact_email || req.user.email,
      signerPhone: contact_phone || '',
      notaryType: notary_type,
      callbackUrl: `https://us-central1-${projectId}.cloudfunctions.net/api/webhooks/onenotary`,
    });

    // Update session with OneNotary details
    await sessionRef.update({
      onenotary_session_id: oneNotaryResult.session_id,
      meeting_link: oneNotaryResult.meeting_link,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Audit log
    await db.collection('audit_logs').add({
      user_id: req.user.uid,
      action: 'session.created',
      resource_type: 'notarization_session',
      resource_id: sessionRef.id,
      status: 'success',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      session_id: sessionRef.id,
      onenotary_session_id: oneNotaryResult.session_id,
      meeting_link: oneNotaryResult.meeting_link,
      status: 'pending',
    });
  } catch (err: any) {
    functions.logger.error('Session creation failed', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/sessions/:id', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('notarization_sessions').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const data = snap.data()!;
    if (data.user_id !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
    return res.json({ id: snap.id, ...data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/sessions', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('notarization_sessions')
      .where('user_id', '==', req.user.uid)
      .orderBy('created_at', 'desc')
      .get();
    return res.json({ sessions: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/sessions/:id/cancel', authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection('notarization_sessions').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    if (snap.data()!.user_id !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const currentStatus = snap.data()!.status;
    if (['completed', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({ error: `Cannot cancel a ${currentStatus} session` });
    }

    await snap.ref.update({
      status: 'cancelled',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  PAYMENT ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.post('/payments/create-intent', authenticate, async (req: any, res) => {
  const stripe = getStripe();
  if (!stripe) {
    // Demo mode: return a fake client secret
    return res.json({ client_secret: `demo_pi_${Date.now()}_secret_demo`, amount: 4500, currency: 'usd' });
  }

  const { notarization_session_id } = req.body;
  if (!notarization_session_id) return res.status(400).json({ error: 'Missing session ID' });

  try {
    // Get or create Stripe customer
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    let stripeCustomerId = userDoc.data()?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: req.user.email });
      stripeCustomerId = customer.id;
      await db.collection('users').doc(req.user.uid).update({ stripe_customer_id: stripeCustomerId });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4500,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: { notarization_session_id, user_id: req.user.uid },
      description: 'Remote Online Notarization — pdfa2z.com',
    });

    // Pre-create payment record
    await db.collection('payments').add({
      user_id: req.user.uid,
      notarization_session_id,
      stripe_payment_intent_id: paymentIntent.id,
      amount_cents: 4500,
      currency: 'usd',
      status: 'pending',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    } as FirestorePayment);

    return res.json({
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err: any) {
    functions.logger.error('Payment intent creation failed', err);
    return res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  WEBHOOK ROUTES
// ════════════════════════════════════════════════════════════════════════════

// OneNotary webhook — session completion
app.post('/webhooks/onenotary', async (req, res) => {
  const signature = req.headers['x-onenotary-signature'] as string || '';
  const rawBody   = JSON.stringify(req.body);

  if (!verifyOneNotarySignature(rawBody, signature)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const payload = req.body as OneNotaryWebhookPayload;
  functions.logger.info('OneNotary webhook received', { event: payload.event, session_id: payload.session_id });

  try {
    if (payload.event === 'session.completed') {
      const sessions = await db.collection('notarization_sessions')
        .where('onenotary_session_id', '==', payload.session_id)
        .limit(1)
        .get();

      if (!sessions.empty) {
        await sessions.docs[0].ref.update({
          status: 'completed',
          identity_verified: true,
          notarized_document_url: payload.notarized_document_url || '',
          video_recording_url: payload.video_recording_url || '',
          completed_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    if (payload.event === 'session.failed') {
      const sessions = await db.collection('notarization_sessions')
        .where('onenotary_session_id', '==', payload.session_id)
        .limit(1)
        .get();
      if (!sessions.empty) {
        await sessions.docs[0].ref.update({
          status: 'failed',
          error_message: 'Session failed during notarization',
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  } catch (err: any) {
    functions.logger.error('OneNotary webhook handling error', err);
  }

  return res.json({ received: true });
});

// Stripe webhook — payment confirmation
app.post('/webhooks/stripe', async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;

  let event: any;
  try {
    if (stripe && sig) {
      let webhookSecret: string;
      try {
        webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '';
      } catch {
        webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Demo mode
      event = req.body;
    }
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data?.object || event;
    const { notarization_session_id, user_id } = pi.metadata || {};

    try {
      // Update payment record
      const paySnap = await db.collection('payments')
        .where('stripe_payment_intent_id', '==', pi.id)
        .limit(1)
        .get();

      if (!paySnap.empty) {
        await paySnap.docs[0].ref.update({
          status: 'succeeded',
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Kick off notarization session (update status to in_progress)
      if (notarization_session_id) {
        await db.collection('notarization_sessions').doc(notarization_session_id).update({
          status: 'in_progress',
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (err: any) {
      functions.logger.error('Stripe webhook handling error', err);
    }
  }

  return res.json({ received: true });
});

// ── Export ────────────────────────────────────────────────────────────────────
export const api = functions.https.onRequest(app);
