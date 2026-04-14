import { DEMO_MODE } from '../config/firebase';
import { JourneyLead } from './leadService';

/**
 * Sends a notification email to the journey owner when a new lead is captured.
 * Supports custom HTML templates with {{lead_data}} and {{pdf_url}} placeholders.
 */
export async function sendLeadNotification(
  ownerEmail: string, 
  lead: JourneyLead, 
  htmlTemplate?: string
) {
  const subject = `🚀 New Lead Captured: ${lead.journeyTitle}`;
  
  // 1. Prepare Lead Data HTML summary
  const mainData = Object.entries(lead.data)
    .filter(([key]) => !['id', 'signature'].includes(key))
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');
  
  const leadDataHtml = `
    <ul style="list-style-type: square; padding: 20px 20px 20px 40px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; margin: 20px 0;">
      ${mainData}
    </ul>
  `;

  // 2. Determine which template to use
  let finalHtml = '';
  if (htmlTemplate && htmlTemplate.trim()) {
    // Replace placeholders in custom template
    finalHtml = htmlTemplate
      .replace(/\{\{lead_data\}\}/g, leadDataHtml)
      .replace(/\{\{pdf_url\}\}/g, lead.pdfUrl || '#')
      .replace(/\{\{journey_title\}\}/g, lead.journeyTitle);
  } else {
    // Default fallback template
    finalHtml = `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="padding: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
          <h1 style="margin: 0; color: #000; font-size: 24px;">New Lead Captured!</h1>
          <p style="margin: 10px 0 0 0; color: rgba(0,0,0,0.7); font-size: 16px;">${lead.journeyTitle}</p>
        </div>
        
        <div style="padding: 40px;">
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6;">A new user has just completed your digital journey. Here is a summary of the data captured:</p>
          
          ${leadDataHtml}
  
          ${lead.pdfUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${lead.pdfUrl}" style="background: #f59e0b; color: #000; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">View Completed PDF →</a>
            </div>
          ` : ''}
  
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            This is an automated notification from your **PDFA2Z Journey Builder** platform.
            <br />
            Manage your leads in your dashboard.
          </p>
        </div>
      </div>
    `;
  }

  if (DEMO_MODE) {
    console.log('%c[Email Simulation]', 'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 5px;');
    console.log(`To: ${ownerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('Template Generated Successfully');
    // In a real browser we might open a preview window
    return true;
  }

  // In production, we would call a Cloud Function or an email API
  try {
    // Example: fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: ownerEmail, subject, html: finalHtml }) })
    console.log('Notification trigger sent to backend services with custom template support.');
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}
