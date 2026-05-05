"use strict";
/**
 * E-Sign email routes
 * POST /esign/send-invitations  — send signing invitations to all pending signers
 * POST /esign/on-signed         — notify owner + trigger next signer (sequential)
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
exports.createEsignRouter = createEsignRouter;
const express_1 = require("express");
const nodemailer = __importStar(require("nodemailer"));
const functions = __importStar(require("firebase-functions")); // used for logger
// ── Mailer (Amazon SES SMTP) ──────────────────────────────────────────────────
function getTransporter() {
    var _a, _b, _c;
    const user = (_a = process.env.SES_SMTP_USER) !== null && _a !== void 0 ? _a : '';
    const pass = (_b = process.env.SES_SMTP_PASS) !== null && _b !== void 0 ? _b : '';
    const host = (_c = process.env.SES_SMTP_HOST) !== null && _c !== void 0 ? _c : 'email-smtp.us-east-1.amazonaws.com';
    return nodemailer.createTransport({
        host,
        port: 587,
        secure: false,
        auth: { user, pass },
    });
}
const FROM = '"PDFA2Z E-Sign" <remotesign@pdfa2z.com>';
const SITE = 'https://pdfa2z.com';
// ── Helpers ───────────────────────────────────────────────────────────────────
function inviteHtml(signerName, ownerName, docTitle, link, customMsg) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:#2563eb;padding:32px 40px">
      <p style="margin:0;color:#fff;font-size:22px;font-weight:900">PDFA2Z E-Sign</p>
    </div>
    <div style="padding:36px 40px">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0f172a">You've been asked to sign a document</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
        <strong style="color:#0f172a">${ownerName}</strong> has sent you <strong style="color:#0f172a">${docTitle}</strong> for your signature.
      </p>
      ${customMsg ? `<div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;margin:0 0 24px"><p style="margin:0;color:#334155;font-size:14px;line-height:1.6;font-style:italic">"${customMsg}"</p></div>` : ''}
      <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">
        Review &amp; Sign Document →
      </a>
      <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6">
        This link is unique to you. Do not share it.<br>
        Powered by <a href="${SITE}" style="color:#2563eb;text-decoration:none">PDFA2Z</a> — Free E-Signing
      </p>
    </div>
  </div>
</body>
</html>`;
}
function completionHtml(ownerName, docTitle, allSigners) {
    const signerList = allSigners.map(s => `<li style="margin:4px 0;color:#334155">${s.name} &lt;${s.email}&gt;</li>`).join('');
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:#10b981;padding:32px 40px">
      <p style="margin:0;color:#fff;font-size:22px;font-weight:900">PDFA2Z E-Sign</p>
    </div>
    <div style="padding:36px 40px">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0f172a">Document fully signed ✓</h1>
      <p style="margin:0 0 16px;color:#64748b;font-size:15px">Hi ${ownerName}, <strong style="color:#0f172a">${docTitle}</strong> has been signed by all parties:</p>
      <ul style="margin:0 0 24px;padding-left:20px;font-size:14px">${signerList}</ul>
      <p style="margin:0;color:#94a3b8;font-size:12px">Log in to <a href="${SITE}/remote-sign" style="color:#2563eb;text-decoration:none">PDFA2Z</a> to download the completed document.</p>
    </div>
  </div>
</body>
</html>`;
}
// ── Router ────────────────────────────────────────────────────────────────────
function createEsignRouter(db) {
    const esignRouter = (0, express_1.Router)();
    // Send invitations
    esignRouter.post('/send-invitations', async (req, res) => {
        const { docId } = req.body;
        if (!docId) {
            res.status(400).json({ error: 'docId required' });
            return;
        }
        try {
            const snap = await db.collection('sign_documents').doc(docId).get();
            if (!snap.exists) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }
            const doc = snap.data();
            const signers = doc.signingOrder === 'sequential'
                ? [doc.signers.find((s) => s.status === 'pending')] // only first pending
                : doc.signers.filter((s) => s.status === 'pending'); // all at once
            const transporter = getTransporter();
            await Promise.all(signers.filter(Boolean).map((signer) => transporter.sendMail({
                from: FROM,
                to: signer.email,
                subject: `Action required: Please sign "${doc.title}"`,
                html: inviteHtml(signer.name, doc.ownerName, doc.title, `${SITE}/sign/${signer.token}`, doc.customMessage || ''),
            })));
            res.json({ ok: true, sent: signers.filter(Boolean).length });
        }
        catch (err) {
            functions.logger.error('send-invitations error', err);
            res.status(500).json({ error: err.message });
        }
    });
    // Called after a signer signs
    esignRouter.post('/on-signed', async (req, res) => {
        const { docId, signerId, allSigned } = req.body;
        if (!docId) {
            res.status(400).json({ error: 'docId required' });
            return;
        }
        try {
            const snap = await db.collection('sign_documents').doc(docId).get();
            if (!snap.exists) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }
            const doc = snap.data();
            const transporter = getTransporter();
            if (allSigned) {
                // Notify owner
                await transporter.sendMail({
                    from: FROM,
                    to: doc.ownerEmail,
                    subject: `✓ "${doc.title}" has been fully signed`,
                    html: completionHtml(doc.ownerName, doc.title, doc.signers.map((s) => ({ name: s.name, email: s.email }))),
                });
            }
            else if (doc.signingOrder === 'sequential') {
                // Find next signer
                const justSigned = doc.signers.find((s) => s.id === signerId);
                const nextSigner = doc.signers.find((s) => { var _a; return s.status === 'pending' && s.order === ((_a = justSigned === null || justSigned === void 0 ? void 0 : justSigned.order) !== null && _a !== void 0 ? _a : 0) + 1; });
                if (nextSigner) {
                    await transporter.sendMail({
                        from: FROM,
                        to: nextSigner.email,
                        subject: `It's your turn to sign "${doc.title}"`,
                        html: inviteHtml(nextSigner.name, doc.ownerName, doc.title, `${SITE}/sign/${nextSigner.token}`, doc.customMessage || ''),
                    });
                }
            }
            res.json({ ok: true });
        }
        catch (err) {
            functions.logger.error('on-signed error', err);
            res.status(500).json({ error: err.message });
        }
    });
    return esignRouter;
}
//# sourceMappingURL=esignRoutes.js.map