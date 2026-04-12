"use strict";
// OneNotary API client with automatic DEMO MODE fallback.
// When ONENOTARY_API_KEY is not set, all operations simulate realistic responses.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOneNotarySession = createOneNotarySession;
exports.verifyOneNotarySignature = verifyOneNotarySignature;
const firebase_functions_1 = require("firebase-functions");
const ONENOTARY_BASE = 'https://api.onenotary.com/v1';
function getApiKey() {
    var _a;
    try {
        // Firebase Functions config
        const config = require('firebase-functions').config();
        return ((_a = config.onenotary) === null || _a === void 0 ? void 0 : _a.api_key) || null;
    }
    catch (_b) {
        return process.env.ONENOTARY_API_KEY || null;
    }
}
/**
 * Create a new notarization session with OneNotary.
 * Falls back to DEMO MODE if API key is not set.
 */
async function createOneNotarySession(params) {
    const apiKey = getApiKey();
    if (!apiKey) {
        firebase_functions_1.logger.warn('DEMO MODE: OneNotary API key not set. Simulating session creation.');
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
function verifyOneNotarySignature(body, signature) {
    const apiKey = getApiKey();
    if (!apiKey)
        return true; // Demo mode — skip verification
    const crypto = require('crypto');
    let webhookSecret;
    try {
        webhookSecret = require('firebase-functions').config().onenotary.webhook_secret;
    }
    catch (_a) {
        webhookSecret = process.env.ONENOTARY_WEBHOOK_SECRET || '';
    }
    const expected = crypto.createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
    return signature === expected;
}
//# sourceMappingURL=onenotaryClient.js.map