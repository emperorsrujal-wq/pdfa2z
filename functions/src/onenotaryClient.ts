// OneNotary API client with automatic DEMO MODE fallback.
// When ONENOTARY_API_KEY is not set, all operations simulate realistic responses.

import { logger } from 'firebase-functions';

const ONENOTARY_BASE = 'https://api.onenotary.com/v1';

function getApiKey(): string | null {
  try {
    // Firebase Functions config
    const config = require('firebase-functions').config();
    return config.onenotary?.api_key || null;
  } catch {
    return process.env.ONENOTARY_API_KEY || null;
  }
}

export interface OneNotarySessionResult {
  session_id: string;
  meeting_link: string;
  status: string;
}

export interface OneNotaryWebhookPayload {
  event: 'session.completed' | 'session.failed' | 'session.cancelled';
  session_id: string;
  status: string;
  notarized_document_url?: string;
  video_recording_url?: string;
  signer_name?: string;
  notary_name?: string;
  completed_at?: string;
}

/**
 * Create a new notarization session with OneNotary.
 * Falls back to DEMO MODE if API key is not set.
 */
export async function createOneNotarySession(params: {
  documentUrl: string;
  signerEmail: string;
  signerPhone: string;
  notaryType: string;
  callbackUrl: string;
}): Promise<OneNotarySessionResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    logger.warn('DEMO MODE: OneNotary API key not set. Simulating session creation.');
    const fakeId = `demo-on-${Date.now()}`;
    return {
      session_id: fakeId,
      meeting_link: `https://meet.onenotary.com/demo/${fakeId}`,
      status: 'pending',
    };
  }

  const response = await fetch(`${ONENOTARY_BASE}/sessions/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document_url: params.documentUrl,
      signer_email: params.signerEmail,
      signer_phone: params.signerPhone,
      notary_type: params.notaryType,
      callback_url: params.callbackUrl,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OneNotary API error ${response.status}: ${err}`);
  }

  return response.json();
}

/**
 * Verify OneNotary webhook HMAC signature.
 * In DEMO MODE, always returns true.
 */
export function verifyOneNotarySignature(body: string, signature: string): boolean {
  const apiKey = getApiKey();
  if (!apiKey) return true; // Demo mode — skip verification

  const crypto = require('crypto');
  let webhookSecret: string;
  try {
    webhookSecret = require('firebase-functions').config().onenotary.webhook_secret;
  } catch {
    webhookSecret = process.env.ONENOTARY_WEBHOOK_SECRET || '';
  }

  const expected = crypto.createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return signature === expected;
}
