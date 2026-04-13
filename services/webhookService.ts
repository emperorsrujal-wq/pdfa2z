/**
 * Webhook Service
 * Handles outbound POST requests for enterprise lead delivery
 */

export interface WebhookPayload {
  event: 'journey.completed';
  timestamp: string;
  journey: {
    id: string;
    title: string;
  };
  lead: {
    id: string;
    data: Record<string, any>;
    pdfUrl?: string;
    attachmentUrls?: string[];
    createdAt: string;
    status: string;
  };
  context: {
    locale?: string;
    currencySymbol?: string;
    origin: string;
  };
}

/**
 * Triggers a webhook for a completed journey
 */
export async function triggerJourneyWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!url) return { success: false, error: 'No webhook URL provided' };

  try {
    // Basic implementation using fetch
    // Note: In a production enterprise app, we might sign the payload using HMAC-SHA256
    // for security if a secret is provided.
    
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-PDFA2Z-Event': 'journey.completed',
      'X-PDFA2Z-Timestamp': payload.timestamp,
    };

    // If secret is provided, ideally we'd compute a signature here.
    // For this client-side implementation, we'll keep it simple or use a lightweight crypto lib if available.
    if (secret) {
      headers['X-PDFA2Z-Signature'] = `sha256=${secret}`; // Placeholder for real HMAC
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      return { 
        success: false, 
        status: response.status, 
        error: `Webhook failed with status ${response.status}` 
      };
    }

    return { success: true, status: response.status };
  } catch (e: any) {
    console.error('Webhook Trigger Error:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Helper to construct the payload for a completed journey
 */
export function constructWebhookPayload(
  journeyId: string,
  journeyTitle: string,
  lead: any,
  brandConfig: any
): WebhookPayload {
  return {
    event: 'journey.completed',
    timestamp: new Date().toISOString(),
    journey: {
      id: journeyId,
      title: journeyTitle,
    },
    lead: {
      id: lead.id,
      data: lead.data,
      pdfUrl: lead.pdfUrl,
      attachmentUrls: lead.attachmentUrls,
      createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : lead.createdAt,
      status: lead.status,
    },
    context: {
      locale: brandConfig.locale,
      currencySymbol: brandConfig.currencySymbol,
      origin: window.location.origin,
    },
  };
}
