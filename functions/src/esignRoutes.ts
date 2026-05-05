/**
 * E-Sign email routes
 * POST /esign/send-invitations  — send signing invitations to all pending signers
 * POST /esign/on-signed         — notify owner + trigger next signer (sequential)
 */

import { Router } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions'; // used for logger

// ── Mailer (Amazon SES SMTP) ──────────────────────────────────────────────────

function getTransporter() {
  const user = process.env.SES_SMTP_USER ?? '';
  const pass = process.env.SES_SMTP_PASS ?? '';
  const host = process.env.SES_SMTP_HOST ?? 'email-smtp.us-east-1.amazonaws.com';
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

function inviteHtml(signerName: string, ownerName: string, docTitle: string, link: string, customMsg: string) {
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

function completionHtml(ownerName: string, docTitle: string, allSigners: { name: string; email: string }[]) {
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

export function createEsignRouter(db: Firestore) {
const esignRouter = Router();

// Send invitations
esignRouter.post('/send-invitations', async (req, res): Promise<void> => {
  const { docId } = req.body as { docId: string };
  if (!docId) { res.status(400).json({ error: 'docId required' }); return; }

  try {
    const snap = await db.collection('sign_documents').doc(docId).get();
    if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
    const doc = snap.data()!;

    const signers: any[] = doc.signingOrder === 'sequential'
      ? [doc.signers.find((s: any) => s.status === 'pending')]  // only first pending
      : doc.signers.filter((s: any) => s.status === 'pending'); // all at once

    const transporter = getTransporter();
    await Promise.all(
      signers.filter(Boolean).map((signer: any) =>
        transporter.sendMail({
          from: FROM,
          to: signer.email,
          subject: `Action required: Please sign "${doc.title}"`,
          html: inviteHtml(
            signer.name,
            doc.ownerName,
            doc.title,
            `${SITE}/sign/${signer.token}`,
            doc.customMessage || '',
          ),
        })
      )
    );

    res.json({ ok: true, sent: signers.filter(Boolean).length });
  } catch (err: any) {
    functions.logger.error('send-invitations error', err);
    res.status(500).json({ error: err.message });
  }
});

// Called after a signer signs
esignRouter.post('/on-signed', async (req, res): Promise<void> => {
  const { docId, signerId, allSigned } = req.body as { docId: string; signerId: string; allSigned: boolean };
  if (!docId) { res.status(400).json({ error: 'docId required' }); return; }

  try {
    const snap = await db.collection('sign_documents').doc(docId).get();
    if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
    const doc = snap.data()!;
    const transporter = getTransporter();

    if (allSigned) {
      // Notify owner
      await transporter.sendMail({
        from: FROM,
        to: doc.ownerEmail,
        subject: `✓ "${doc.title}" has been fully signed`,
        html: completionHtml(doc.ownerName, doc.title, doc.signers.map((s: any) => ({ name: s.name, email: s.email }))),
      });
    } else if (doc.signingOrder === 'sequential') {
      // Find next signer
      const justSigned = doc.signers.find((s: any) => s.id === signerId);
      const nextSigner = doc.signers.find((s: any) => s.status === 'pending' && s.order === (justSigned?.order ?? 0) + 1);
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
  } catch (err: any) {
    functions.logger.error('on-signed error', err);
    res.status(500).json({ error: err.message });
  }
});

return esignRouter;
}
