/**
 * E-Sign email routes & notification system
 *
 * Routes:
 *   POST /esign/request-otp        — generate & email a 6-digit OTP to the signer
 *   POST /esign/verify-otp         — verify the OTP (3 attempts, 15-min TTL)
 *   POST /esign/send-invitations   — initial invite to signers + owner confirmation
 *   POST /esign/on-viewed          — notify owner when signer views
 *   POST /esign/on-signed          — signer confirmation + owner alert + next in sequence
 *   POST /esign/on-declined        — owner declined alert
 *   POST /esign/on-completed       — final completion email to all parties with download link
 */

import { Router } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

// ── Mailer ────────────────────────────────────────────────────────────────────

function getTransporter() {
  const user = process.env.SES_SMTP_USER ?? '';
  const pass = process.env.SES_SMTP_PASS ?? '';
  const host = process.env.SES_SMTP_HOST ?? 'email-smtp.us-east-1.amazonaws.com';
  return nodemailer.createTransport({ host, port: 587, secure: false, auth: { user, pass } });
}

export async function sendMail(to: string, subject: string, html: string) {
  await getTransporter().sendMail({ from: '"PDFA2Z E-Sign" <remotesign@pdfa2z.com>', to, subject, html });
}

const SITE = 'https://pdfa2z.com';

// ══════════════════════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES
// ══════════════════════════════════════════════════════════════════════════════

const css = `
  body{margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;}
  .wrap{max-width:600px;margin:36px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(15,23,42,.10);}
  .header{padding:32px 44px 28px;}
  .logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:28px;}
  .logo-box{width:38px;height:38px;background:rgba(255,255,255,.22);border-radius:10px;display:flex;align-items:center;justify-content:center;}
  .logo-text{color:#fff;font-size:13px;font-weight:900;letter-spacing:.02em;}
  .logo-brand{color:#fff;font-size:17px;font-weight:900;opacity:.95;}
  .badge{display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
  .body{padding:36px 44px;}
  .doc-card{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin:0 0 28px;}
  .doc-title{font-size:17px;font-weight:800;color:#0f172a;margin:0 0 6px;}
  .doc-meta{font-size:13px;color:#94a3b8;margin:0;}
  .cta{display:inline-block;padding:15px 36px;border-radius:13px;font-size:15px;font-weight:800;text-decoration:none;letter-spacing:.01em;}
  .divider{border:none;border-top:1.5px solid #f1f5f9;margin:28px 0;}
  .signers-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .signer-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:100px;font-size:13px;font-weight:600;color:#334155;}
  .avatar{width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;}
  .status-dot{width:9px;height:9px;border-radius:50%;display:inline-block;}
  .footer{padding:20px 44px 28px;border-top:1.5px solid #f1f5f9;}
  .footer p{margin:0;font-size:12px;color:#94a3b8;line-height:1.7;}
  .footer a{color:#2563eb;text-decoration:none;}
  @media(max-width:620px){.body,.header,.footer{padding-left:24px;padding-right:24px;}.cta{width:100%;text-align:center;box-sizing:border-box;}}
`;

function wrap(headerColor: string, headerContent: string, bodyContent: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="wrap">
<div class="header" style="background:${headerColor};">${headerContent}</div>
<div class="body">${bodyContent}</div>
<div class="footer">
  <p>This email was sent by <a href="${SITE}">PDFA2Z E-Sign</a> on behalf of a document sender. Electronic signatures created with PDFA2Z comply with ESIGN and eIDAS regulations and are legally binding. If you did not expect this email, you may safely ignore it.</p>
</div>
</div></body></html>`;
}

function logo(): string {
  return `<div class="logo">
    <div class="logo-box"><span class="logo-text">A2Z</span></div>
    <span class="logo-brand">PDFA2Z E&#8209;Sign</span>
  </div>`;
}

function docCard(title: string, pages: number, ownerName: string, order: string): string {
  return `<div class="doc-card">
    <p class="doc-title">📄 ${title}</p>
    <p class="doc-meta">${pages} page${pages !== 1 ? 's' : ''} &nbsp;·&nbsp; Requested by <strong style="color:#475569">${ownerName}</strong> &nbsp;·&nbsp; ${order} signing</p>
  </div>`;
}

function ctaButton(label: string, href: string, color: string): string {
  return `<a href="${href}" class="cta" style="background:${color};color:#fff;">${label}</a>`;
}

function signerRow(signers: { name: string; color: string; status: string }[]): string {
  const statusColors: Record<string, string> = { pending: '#94a3b8', viewed: '#f59e0b', signed: '#10b981', declined: '#ef4444' };
  return `<div class="signers-row">${signers.map(s => `
    <span class="signer-chip">
      <span class="avatar" style="background:${s.color}">${s.name.charAt(0).toUpperCase()}</span>
      ${s.name}
      <span class="status-dot" style="background:${statusColors[s.status] || '#94a3b8'}" title="${s.status}"></span>
    </span>`).join('')}</div>`;
}

// ── 1. Signer Invitation ──────────────────────────────────────────────────────

export function buildInviteEmail(p: {
  signerName: string; ownerName: string; docTitle: string; docPages: number;
  signingOrder: string; link: string; customMsg?: string; allSigners: any[];
}): string {
  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">✍️ &nbsp;Signature Requested</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">You've been asked<br>to sign a document</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.signerName}</strong>, <strong style="color:#0f172a">${p.ownerName}</strong> has sent you a document for your electronic signature.</p>
    ${docCard(p.docTitle, p.docPages, p.ownerName, p.signingOrder)}
    ${p.customMsg ? `<div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 24px;"><p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;font-style:italic;">"${p.customMsg}"</p></div>` : ''}
    ${ctaButton('Review &amp; Sign Document &rarr;', p.link, '#2563eb')}
    <hr class="divider">
    <p style="font-size:13px;font-weight:700;color:#64748b;margin:0 0 10px;">All signing parties</p>
    ${signerRow(p.allSigners)}
    <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;line-height:1.7;">🔒 Your signing link is private and unique to you. Never share it.<br>The link expires in accordance with the document settings.</p>`;

  return wrap('linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%)', header, body);
}

// ── 2. Reminder (24h / recurring) ────────────────────────────────────────────

export function buildReminderEmail(p: {
  signerName: string; ownerName: string; docTitle: string; docPages: number;
  signingOrder: string; link: string; reminderCount: number; expiresAt?: Date;
}): string {
  const isFirst = p.reminderCount === 1;
  const expireNote = p.expiresAt
    ? `<p style="font-size:13px;color:#b45309;background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:11px 16px;margin:20px 0 0;">⏳ This document expires on <strong>${p.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>. Please sign before then.</p>`
    : '';

  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">🔔 &nbsp;Reminder</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">${isFirst ? 'Your signature\nis still needed' : 'Friendly reminder\nto sign'}</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.signerName}</strong>, this is a${isFirst ? ' first' : ' friendly'} reminder that <strong style="color:#0f172a">${p.ownerName}</strong> is waiting for your signature on the document below.</p>
    ${docCard(p.docTitle, p.docPages, p.ownerName, p.signingOrder)}
    ${ctaButton('Sign Now &rarr;', p.link, '#d97706')}
    ${expireNote}
    <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;">If you'd like to decline, you can do so from within the signing portal. If you have questions, reply to this email or contact ${p.ownerName} directly.</p>`;

  return wrap('linear-gradient(135deg,#b45309 0%,#d97706 60%,#f59e0b 100%)', header, body);
}

// ── 3. Signer — Signed Confirmation ──────────────────────────────────────────

export function buildSignerConfirmationEmail(p: {
  signerName: string; docTitle: string; ownerName: string;
  signedAt: Date; allSigned: boolean; downloadUrl?: string;
}): string {
  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">✅ &nbsp;Signature Confirmed</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">You've successfully<br>signed the document</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.signerName}</strong>, your electronic signature has been recorded. Here are the details:</p>
    <div class="doc-card">
      <p class="doc-title">📄 ${p.docTitle}</p>
      <p class="doc-meta">Requested by <strong style="color:#475569">${p.ownerName}</strong></p>
      <p class="doc-meta" style="margin-top:6px;">Signed on <strong style="color:#475569">${p.signedAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong> at <strong style="color:#475569">${p.signedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</strong></p>
    </div>
    ${p.allSigned && p.downloadUrl
      ? `<p style="font-size:15px;font-weight:700;color:#065f46;margin:0 0 16px;">🎉 All parties have signed! The document is complete.</p>${ctaButton('Download Signed Document &darr;', p.downloadUrl, '#059669')}`
      : `<div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:16px 20px;"><p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">Your signature has been submitted. The other signing parties will be notified. Once everyone has signed, you'll receive another email with the completed document.</p></div>`
    }
    <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;">A full audit trail is maintained securely. Your electronic signature is legally binding.</p>`;

  return wrap('linear-gradient(135deg,#047857 0%,#059669 60%,#10b981 100%)', header, body);
}

// ── 4. Owner — Document Sent Confirmation ────────────────────────────────────

export function buildOwnerSentEmail(p: {
  ownerName: string; docTitle: string; docPages: number; signingOrder: string;
  signers: { name: string; email: string; color: string; status: string }[];
  expiresAt?: Date;
}): string {
  const signerList = p.signers.map((s, i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="width:30px;height:30px;border-radius:50%;background:${s.color};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;">${s.name.charAt(0)}</span>
          <div>
            <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${s.name}</p>
            <p style="margin:0;font-size:12px;color:#64748b;">${s.email}</p>
          </div>
          ${p.signingOrder === 'sequential' ? `<span style="margin-left:auto;font-size:11px;font-weight:700;color:#94a3b8;background:#f1f5f9;padding:3px 9px;border-radius:100px;">Sign #${i + 1}</span>` : ''}
        </div>
      </td>
    </tr>`).join('');

  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">📤 &nbsp;Document Sent</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">Your document is out<br>for signature</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.ownerName}</strong>, signing invitations have been sent to all parties. You'll receive updates as each person signs.</p>
    ${docCard(p.docTitle, p.docPages, p.ownerName, p.signingOrder)}
    <p style="font-size:13px;font-weight:700;color:#64748b;margin:0 0 12px;">Signers (${p.signers.length})</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${signerList}</table>
    ${p.expiresAt ? `<p style="font-size:13px;color:#64748b;margin:20px 0 0;">⏳ This document expires on <strong style="color:#0f172a">${p.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>. Signers will receive reminders.</p>` : ''}
    <hr class="divider">
    ${ctaButton('View Document Status &rarr;', `${SITE}/remote-sign`, '#2563eb')}`;

  return wrap('linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%)', header, body);
}

// ── 5. Owner — Individual Signer Signed ──────────────────────────────────────

export function buildOwnerSignedNotificationEmail(p: {
  ownerName: string; docTitle: string; signerName: string; signerEmail: string;
  signedAt: Date; remaining: number; totalSigners: number;
}): string {
  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">✍️ &nbsp;Signature Received</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">${p.signerName}<br>has signed</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.ownerName}</strong>, <strong style="color:#0f172a">${p.signerName}</strong> (${p.signerEmail}) has signed <strong style="color:#0f172a">${p.docTitle}</strong>.</p>
    <div style="display:flex;gap:20px;margin:0 0 24px;">
      <div style="flex:1;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:18px 20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:900;color:#059669;">${p.totalSigners - p.remaining}</p>
        <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:.04em;">Signed</p>
      </div>
      <div style="flex:1;background:${p.remaining === 0 ? '#f0fdf4' : '#fff7ed'};border:1.5px solid ${p.remaining === 0 ? '#bbf7d0' : '#fed7aa'};border-radius:14px;padding:18px 20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:900;color:${p.remaining === 0 ? '#059669' : '#ea580c'};">${p.remaining}</p>
        <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:${p.remaining === 0 ? '#065f46' : '#9a3412'};text-transform:uppercase;letter-spacing:.04em;">Remaining</p>
      </div>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 20px;">Signed on ${p.signedAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${p.signedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
    ${ctaButton('View Document Status &rarr;', `${SITE}/remote-sign`, '#2563eb')}`;

  return wrap('linear-gradient(135deg,#047857 0%,#059669 60%,#10b981 100%)', header, body);
}

// ── 6. All Parties — Document Completed ──────────────────────────────────────

export function buildCompletedEmail(p: {
  recipientName: string; isOwner: boolean; docTitle: string;
  signers: { name: string; email: string; color: string; signedAt?: Date }[];
  downloadUrl: string; completedAt: Date;
}): string {
  const signerRows = p.signers.map(s => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="width:28px;height:28px;border-radius:50%;background:${s.color};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;vertical-align:middle;margin-right:10px;">${s.name.charAt(0)}</span>
        <span style="font-size:14px;font-weight:700;color:#0f172a;vertical-align:middle;">${s.name}</span>
        <span style="font-size:12px;color:#94a3b8;margin-left:8px;vertical-align:middle;">${s.email}</span>
        <span style="float:right;font-size:12px;color:#059669;font-weight:700;vertical-align:middle;">✓ Signed${s.signedAt ? ' ' + s.signedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
      </td>
    </tr>`).join('');

  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">🎉 &nbsp;Fully Executed</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">Document fully<br>signed by all parties</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.recipientName}</strong>, ${p.isOwner ? 'your document' : 'the document'} <strong style="color:#0f172a">${p.docTitle}</strong> has been signed by all parties and is now legally executed.</p>
    <div class="doc-card" style="background:#f0fdf4;border-color:#bbf7d0;">
      <p class="doc-title" style="color:#065f46;">📄 ${p.docTitle}</p>
      <p class="doc-meta">Completed on <strong style="color:#047857">${p.completedAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
    </div>
    <p style="font-size:13px;font-weight:700;color:#64748b;margin:0 0 12px;">Signing parties</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">${signerRows}</table>
    ${ctaButton('⬇ Download Signed Document', p.downloadUrl, '#059669')}
    <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;line-height:1.7;">A complete audit trail including timestamps, IP addresses, and signature data has been recorded and is attached to this document. ${p.isOwner ? `You can also access all your documents at <a href="${SITE}/remote-sign" style="color:#2563eb;text-decoration:none">pdfa2z.com/remote-sign</a>.` : 'Please keep this email for your records.'}</p>`;

  return wrap('linear-gradient(135deg,#047857 0%,#059669 60%,#10b981 100%)', header, body);
}

// ── 7. Owner — Signer Declined ────────────────────────────────────────────────

export function buildDeclinedEmail(p: {
  ownerName: string; docTitle: string; signerName: string;
  signerEmail: string; reason: string; declinedAt: Date;
}): string {
  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">⚠️ &nbsp;Signing Declined</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">${p.signerName}<br>declined to sign</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.ownerName}</strong>, <strong style="color:#0f172a">${p.signerName}</strong> (${p.signerEmail}) has declined to sign <strong style="color:#0f172a">${p.docTitle}</strong>.</p>
    <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.06em;">Reason provided</p>
      <p style="margin:0;font-size:15px;color:#7f1d1d;font-style:italic;line-height:1.6;">"${p.reason}"</p>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 24px;">Declined on ${p.declinedAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${p.declinedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
    ${ctaButton('View Document &rarr;', `${SITE}/remote-sign`, '#dc2626')}
    <hr class="divider">
    <p style="font-size:13px;color:#64748b;line-height:1.7;">You can void the document and create a new version, or reach out to ${p.signerName} to resolve their concerns before resending.</p>`;

  return wrap('linear-gradient(135deg,#991b1b 0%,#dc2626 60%,#ef4444 100%)', header, body);
}

// ── 0. OTP Verification Email ────────────────────────────────────────────────

export function buildOtpEmail(p: {
  signerName: string; otp: string; docTitle: string; ownerName: string;
}): string {
  const digits = p.otp.split('').map(d =>
    `<span style="display:inline-block;width:48px;height:60px;line-height:60px;text-align:center;font-size:28px;font-weight:900;color:#0f172a;background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;margin:0 4px;">${d}</span>`
  ).join('');

  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">🔐 &nbsp;Verify Your Identity</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">Your one-time<br>verification code</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 28px;">Hi <strong style="color:#0f172a">${p.signerName}</strong>, use the code below to verify your identity and access the document <strong style="color:#0f172a">"${p.docTitle}"</strong> from ${p.ownerName}.</p>
    <div style="text-align:center;margin:0 0 28px;padding:28px 20px;background:#f8fafc;border-radius:16px;border:1.5px solid #e2e8f0;">
      <div>${digits}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">⏱ This code expires in <strong style="color:#475569">15 minutes</strong></p>
    </div>
    <div class="doc-card">
      <p class="doc-title">📄 ${p.docTitle}</p>
      <p class="doc-meta">Requested by <strong style="color:#475569">${p.ownerName}</strong></p>
    </div>
    <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;line-height:1.7;">If you did not request this code, please ignore this email. Do not share this code with anyone. PDFA2Z will never ask for your code.</p>`;

  return wrap('linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%)', header, body);
}

// ── 8. Expiry Warning (to signer) ─────────────────────────────────────────────

export function buildExpiryWarningEmail(p: {
  signerName: string; ownerName: string; docTitle: string;
  docPages: number; signingOrder: string; link: string; expiresAt: Date;
}): string {
  const daysLeft = Math.ceil((p.expiresAt.getTime() - Date.now()) / 86400000);

  const header = `${logo()}
    <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;">⏳ &nbsp;Expiring Soon</span>
    <h1 style="margin:16px 0 0;color:#fff;font-size:24px;font-weight:900;line-height:1.25;">Document expires<br>in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</h1>`;

  const body = `
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">Hi <strong style="color:#0f172a">${p.signerName}</strong>, the document below will expire on <strong style="color:#b45309">${p.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>. Please sign before it expires.</p>
    ${docCard(p.docTitle, p.docPages, p.ownerName, p.signingOrder)}
    ${ctaButton('Sign Before It Expires &rarr;', p.link, '#d97706')}
    <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;">After the expiry date, this signing link will no longer be valid. Contact ${p.ownerName} if you need an extension.</p>`;

  return wrap('linear-gradient(135deg,#92400e 0%,#b45309 60%,#d97706 100%)', header, body);
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROUTER
// ══════════════════════════════════════════════════════════════════════════════

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}${'*'.repeat(Math.max(1, local.length - 2))}${local.charAt(local.length - 1)}@${domain}`;
}

export function createEsignRouter(db: Firestore) {
  const router = Router();

  // ── Request OTP ────────────────────────────────────────────────────────────
  router.post('/request-otp', async (req, res): Promise<void> => {
    const { token } = req.body as { token: string };
    if (!token) { res.status(400).json({ error: 'token required' }); return; }
    try {
      const tokenSnap = await db.collection('sign_tokens').doc(token).get();
      if (!tokenSnap.exists) { res.status(404).json({ error: 'Invalid link' }); return; }
      const { docId, signerId } = tokenSnap.data()!;

      const docSnap = await db.collection('sign_documents').doc(docId).get();
      if (!docSnap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
      const document = docSnap.data()!;
      const signer = document.signers.find((s: any) => s.id === signerId);
      if (!signer) { res.status(404).json({ error: 'Signer not found' }); return; }

      // Rate-limit: block if OTP was sent in the last 60 seconds
      const otpSnap = await db.collection('sign_otps').doc(token).get();
      if (otpSnap.exists) {
        const existing = otpSnap.data()!;
        const sentAt: number = existing.sentAt ?? 0;
        if (Date.now() - sentAt < 60_000) {
          res.status(429).json({ maskedEmail: maskEmail(signer.email), rateLimited: true });
          return;
        }
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await db.collection('sign_otps').doc(token).set({ otp, expiresAt, attempts: 0, verified: false, sentAt: Date.now() });

      await sendMail(
        signer.email,
        `${otp} is your PDFA2Z signing verification code`,
        buildOtpEmail({ signerName: signer.name, otp, docTitle: document.title, ownerName: document.ownerName }),
      );

      res.json({ maskedEmail: maskEmail(signer.email) });
    } catch (err: any) {
      functions.logger.error('request-otp', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  router.post('/verify-otp', async (req, res): Promise<void> => {
    const { token, otp } = req.body as { token: string; otp: string };
    if (!token || !otp) { res.status(400).json({ error: 'token and otp required' }); return; }
    try {
      const otpSnap = await db.collection('sign_otps').doc(token).get();
      if (!otpSnap.exists) { res.status(400).json({ error: 'No OTP found. Request a new code.' }); return; }

      const data = otpSnap.data()!;
      if (Date.now() > data.expiresAt) { res.status(400).json({ error: 'Code expired. Request a new one.' }); return; }
      if (data.attempts >= 3) { res.status(429).json({ error: 'Too many attempts. Request a new code.' }); return; }
      if (data.verified) { res.json({ ok: true }); return; }

      if (data.otp !== otp.trim()) {
        await db.collection('sign_otps').doc(token).update({ attempts: data.attempts + 1 });
        const remaining = 2 - data.attempts;
        res.status(400).json({ error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` });
        return;
      }

      await db.collection('sign_otps').doc(token).update({ verified: true });
      res.json({ ok: true });
    } catch (err: any) {
      functions.logger.error('verify-otp', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Send Invitations + Owner Confirmation ──────────────────────────────────
  router.post('/send-invitations', async (req, res): Promise<void> => {
    const { docId } = req.body as { docId: string };
    if (!docId) { res.status(400).json({ error: 'docId required' }); return; }
    try {
      const snap = await db.collection('sign_documents').doc(docId).get();
      if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
      const doc = snap.data()!;

      // Always invite all pending signers upfront so every party knows a document awaits them.
      // Sequential order is still enforced in the signing portal (shows "not your turn" if needed).
      const toInvite: any[] = doc.signers.filter((s: any) => s.status === 'pending');

      const expiry = doc.expiresAt?.seconds ? new Date(doc.expiresAt.seconds * 1000) : undefined;

      // Send invites to signers
      await Promise.all(toInvite.filter(Boolean).map((signer: any) =>
        sendMail(
          signer.email,
          `Action Required: Please sign "${doc.title}"`,
          buildInviteEmail({
            signerName: signer.name,
            ownerName: doc.ownerName,
            docTitle: doc.title,
            docPages: doc.pageCount ?? 1,
            signingOrder: doc.signingOrder,
            link: `${SITE}/sign/${signer.token}`,
            customMsg: doc.customMessage,
            allSigners: doc.signers.map((s: any) => ({ name: s.name, color: s.color, status: s.status })),
          }),
        )
      ));

      // Send owner confirmation
      await sendMail(
        doc.ownerEmail,
        `Your document "${doc.title}" has been sent for signature`,
        buildOwnerSentEmail({
          ownerName: doc.ownerName,
          docTitle: doc.title,
          docPages: doc.pageCount ?? 1,
          signingOrder: doc.signingOrder,
          signers: doc.signers.map((s: any) => ({ name: s.name, email: s.email, color: s.color, status: s.status })),
          expiresAt: expiry,
        }),
      );

      // Mark invite time on each signer
      const now = Date.now();
      const updatedSigners = doc.signers.map((s: any) =>
        toInvite.find((t: any) => t?.id === s.id) ? { ...s, invitedAt: now, reminderCount: 0 } : s
      );
      await db.collection('sign_documents').doc(docId).update({ signers: updatedSigners });

      res.json({ ok: true, sent: toInvite.filter(Boolean).length });
    } catch (err: any) {
      functions.logger.error('send-invitations', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Signer Viewed ──────────────────────────────────────────────────────────
  router.post('/on-viewed', async (req, res): Promise<void> => {
    const { docId, signerId } = req.body as { docId: string; signerId: string };
    if (!docId) { res.status(400).json({ error: 'docId required' }); return; }
    try {
      const snap = await db.collection('sign_documents').doc(docId).get();
      if (!snap.exists) { res.status(200).json({ ok: true }); return; }
      const doc = snap.data()!;
      const signer = doc.signers.find((s: any) => s.id === signerId);
      if (!signer) { res.status(200).json({ ok: true }); return; }
      // No email for viewed — avoids noise. Just ack.
      res.json({ ok: true });
    } catch (err: any) {
      functions.logger.error('on-viewed', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Signer Signed ──────────────────────────────────────────────────────────
  router.post('/on-signed', async (req, res): Promise<void> => {
    const { docId, signerId, allSigned } = req.body as { docId: string; signerId: string; allSigned: boolean };
    if (!docId) { res.status(400).json({ error: 'docId required' }); return; }
    try {
      const snap = await db.collection('sign_documents').doc(docId).get();
      if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
      const doc = snap.data()!;
      const signer = doc.signers.find((s: any) => s.id === signerId);
      if (!signer) { res.status(404).json({ error: 'Signer not found' }); return; }

      const signedAt = new Date();
      const remaining = doc.signers.filter((s: any) => s.id !== signerId && s.status !== 'signed').length;

      // 1. Confirm to the signer who just signed
      await sendMail(
        signer.email,
        allSigned ? `✅ All done — "${doc.title}" is fully signed` : `✅ Signature confirmed — "${doc.title}"`,
        buildSignerConfirmationEmail({
          signerName: signer.name,
          docTitle: doc.title,
          ownerName: doc.ownerName,
          signedAt,
          allSigned,
          downloadUrl: allSigned ? doc.signedPdfUrl : undefined,
        }),
      );

      // 2. Notify owner
      await sendMail(
        doc.ownerEmail,
        `${signer.name} signed "${doc.title}" — ${remaining} signature${remaining !== 1 ? 's' : ''} remaining`,
        buildOwnerSignedNotificationEmail({
          ownerName: doc.ownerName,
          docTitle: doc.title,
          signerName: signer.name,
          signerEmail: signer.email,
          signedAt,
          remaining,
          totalSigners: doc.signers.length,
        }),
      );

      // 3. Trigger next signer in sequential mode
      if (!allSigned && doc.signingOrder === 'sequential') {
        const justSigned = doc.signers.find((s: any) => s.id === signerId);
        const nextSigner = doc.signers.find((s: any) => s.status === 'pending' && s.order === (justSigned?.order ?? 0) + 1);
        if (nextSigner) {
          await sendMail(
            nextSigner.email,
            `It's your turn to sign "${doc.title}"`,
            buildInviteEmail({
              signerName: nextSigner.name,
              ownerName: doc.ownerName,
              docTitle: doc.title,
              docPages: doc.pageCount ?? 1,
              signingOrder: doc.signingOrder,
              link: `${SITE}/sign/${nextSigner.token}`,
              customMsg: doc.customMessage,
              allSigners: doc.signers.map((s: any) => ({ name: s.name, color: s.color, status: s.status })),
            }),
          );
          const now = Date.now();
          const updatedSigners = doc.signers.map((s: any) =>
            s.id === nextSigner.id ? { ...s, invitedAt: now, reminderCount: 0 } : s
          );
          await db.collection('sign_documents').doc(docId).update({ signers: updatedSigners });
        }
      }

      res.json({ ok: true });
    } catch (err: any) {
      functions.logger.error('on-signed', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Document Completed ─────────────────────────────────────────────────────
  router.post('/on-completed', async (req, res): Promise<void> => {
    const { docId } = req.body as { docId: string };
    if (!docId) { res.status(400).json({ error: 'docId required' }); return; }
    try {
      const snap = await db.collection('sign_documents').doc(docId).get();
      if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
      const doc = snap.data()!;
      const completedAt = new Date();
      const signersInfo = doc.signers.map((s: any) => ({
        name: s.name, email: s.email, color: s.color,
        signedAt: s.signedAt ? new Date(s.signedAt.seconds ? s.signedAt.seconds * 1000 : s.signedAt) : undefined,
      }));

      // Email owner + all signers
      const recipients = [
        { name: doc.ownerName, email: doc.ownerEmail, isOwner: true },
        ...doc.signers.map((s: any) => ({ name: s.name, email: s.email, isOwner: false })),
      ];

      await Promise.all(recipients.map(r =>
        sendMail(
          r.email,
          `🎉 "${doc.title}" — fully signed by all parties`,
          buildCompletedEmail({
            recipientName: r.name,
            isOwner: r.isOwner,
            docTitle: doc.title,
            signers: signersInfo,
            downloadUrl: doc.signedPdfUrl || `${SITE}/remote-sign`,
            completedAt,
          }),
        )
      ));

      res.json({ ok: true });
    } catch (err: any) {
      functions.logger.error('on-completed', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Signer Declined ────────────────────────────────────────────────────────
  router.post('/on-declined', async (req, res): Promise<void> => {
    const { docId, signerId } = req.body as { docId: string; signerId: string };
    if (!docId) { res.status(400).json({ error: 'docId required' }); return; }
    try {
      const snap = await db.collection('sign_documents').doc(docId).get();
      if (!snap.exists) { res.status(404).json({ error: 'Document not found' }); return; }
      const doc = snap.data()!;
      const signer = doc.signers.find((s: any) => s.id === signerId);
      if (!signer) { res.status(200).json({ ok: true }); return; }

      await sendMail(
        doc.ownerEmail,
        `⚠️ ${signer.name} declined to sign "${doc.title}"`,
        buildDeclinedEmail({
          ownerName: doc.ownerName,
          docTitle: doc.title,
          signerName: signer.name,
          signerEmail: signer.email,
          reason: signer.declineReason || 'No reason provided',
          declinedAt: signer.declinedAt?.seconds ? new Date(signer.declinedAt.seconds * 1000) : new Date(),
        }),
      );

      res.json({ ok: true });
    } catch (err: any) {
      functions.logger.error('on-declined', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── PDF proxy — stream PDF bytes through functions to avoid Storage CORS ──────
  // Firebase Storage buckets on *.firebasestorage.app require explicit CORS
  // config. Rather than configuring gsutil, we proxy via this endpoint which
  // already has cors({ origin: true }) from the parent Express app.
  router.get('/pdf', async (req, res): Promise<void> => {
    const { docId, token } = req.query as { docId?: string; token?: string };
    if (!docId || !token) { res.status(400).json({ error: 'docId and token required' }); return; }
    try {
      // Validate token → docId mapping so only authorised signers can fetch
      const tokenSnap = await db.collection('sign_tokens').doc(token).get();
      if (!tokenSnap.exists || tokenSnap.data()!.docId !== docId) {
        res.status(403).json({ error: 'Invalid token' }); return;
      }
      const bucket = admin.storage().bucket();
      const file = bucket.file(`sign_pdfs/${docId}/original.pdf`);
      const [exists] = await file.exists();
      if (!exists) { res.status(404).json({ error: 'PDF not found' }); return; }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      file.createReadStream().pipe(res);
    } catch (err: any) {
      functions.logger.error('pdf-proxy', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
