import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';
import { getCurrentUser } from './authService';
import { uploadFile } from './storageService';
import { GeoData } from './geoService';

export interface SyncItem {
  id: string;
  type: 'lead_save' | 'webhook_trigger';
  data: any;
  retries: number;
}

export interface JourneyLead {
  id?: string;
  journeyId: string;     // Unique ID for the journey (filename or custom ID)
  journeyTitle: string;
  ownerId: string;      // The user ID of the person who created the journey
  data: Record<string, any>;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'closed';
  pdfUrl?: string;      // Link to the generated/filled PDF in Storage
  attachmentUrls?: string[]; // Links to raw file attachments
  geoData?: GeoData;    // Geolocation data captured during submission
  followUpDate?: string; // ISO date string
  notes?: string;       // CRM notes
  createdAt: Timestamp | any;
}

const LEADS_COLLECTION = 'journey_leads';

/**
 * Saves a new lead submission to Firestore + Storage
 */
export async function saveJourneyLead(
  journeyId: string, 
  journeyTitle: string, 
  ownerId: string, 
  data: Record<string, any>,
  pdfBlob?: Blob,
  attachments: { name: string, file: File | Blob }[] = [],
  geoData?: GeoData
): Promise<{ id: string, pdfUrl: string, attachmentUrls: string[] }> {
  // Pre-generate ID if needed for storage paths
  const leadId = `lead_${Date.now()}`;
  
  let pdfUrl = '';
  const attachmentUrls: string[] = [];

  // 1. Upload Generated PDF if provided
  if (pdfBlob && !DEMO_MODE) {
    try {
      const path = `journey_results/${ownerId}/${journeyId}/${leadId}/submission.pdf`;
      pdfUrl = await uploadFile(pdfBlob, path);
    } catch (e) {
      console.error('Failed to upload submission PDF:', e);
    }
  } else if (pdfBlob && DEMO_MODE) {
    pdfUrl = URL.createObjectURL(pdfBlob);
  }

  // 2. Upload Attachments if any
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      if (DEMO_MODE) {
        attachmentUrls.push(URL.createObjectURL(attachment.file));
      } else {
        try {
          const path = `journey_results/${ownerId}/${journeyId}/${leadId}/attachments/${attachment.name}`;
          const url = await uploadFile(attachment.file, path);
          attachmentUrls.push(url);
        } catch (e) {
          console.error(`Failed to upload attachment ${attachment.name}:`, e);
        }
      }
    }
  }

  const lead: Omit<JourneyLead, 'id'> = {
    journeyId,
    journeyTitle,
    ownerId,
    data,
    status: 'new',
    pdfUrl,
    attachmentUrls,
    geoData,
    createdAt: serverTimestamp(),
  };

  if (DEMO_MODE) {
    console.log('[Demo Mode] Saving lead:', lead);
    // Persist to localStorage for demo persistence
    const demoLeads = JSON.parse(localStorage.getItem('pdfa2z_demo_leads') || '[]');
    const newLead = { ...lead, id: leadId, createdAt: new Date().toISOString() };
    demoLeads.unshift(newLead);
    localStorage.setItem('pdfa2z_demo_leads', JSON.stringify(demoLeads));
    return { id: leadId, pdfUrl, attachmentUrls };
  }

  const docRef = await addDoc(collection(db, LEADS_COLLECTION), lead);
  return { id: docRef.id, pdfUrl, attachmentUrls };
}

/**
 * Updates a lead's status
 */
export async function updateLeadStatus(leadId: string, status: JourneyLead['status']): Promise<void> {
  if (DEMO_MODE) {
    const demoLeads = JSON.parse(localStorage.getItem('pdfa2z_demo_leads') || '[]');
    const updated = demoLeads.map((l: any) => l.id === leadId ? { ...l, status } : l);
    localStorage.setItem('pdfa2z_demo_leads', JSON.stringify(updated));
    return;
  }

  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  await updateDoc(leadRef, { status });
}

/**
 * Retrieves leads for a specific journey owner
 */
export async function getLeadsForOwner(ownerId?: string): Promise<JourneyLead[]> {
  const userId = ownerId || getCurrentUser()?.uid;
  if (!userId) return [];

  if (DEMO_MODE) {
    const stored = localStorage.getItem('pdfa2z_demo_leads');
    if (!stored) return [];
    return JSON.parse(stored);
  }

  const q = query(
    collection(db, LEADS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as JourneyLead));
}

/**
 * Deletes a lead from the system
 */
export async function deleteLead(leadId: string) {
  if (DEMO_MODE) {
    const leads = JSON.parse(localStorage.getItem(LEADS_COLLECTION) || '[]');
    const filtered = leads.filter((l: any) => l.id !== leadId);
    localStorage.setItem(LEADS_COLLECTION, JSON.stringify(filtered));
    return;
  }

  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  await deleteDoc(leadRef);
}

/**
 * Updates a lead with new data (e.g. notes, follow-up date)
 */
export async function updateLead(leadId: string, updates: Partial<JourneyLead>): Promise<void> {
  if (DEMO_MODE) {
    const demoLeads = JSON.parse(localStorage.getItem('pdfa2z_demo_leads') || '[]');
    const updated = demoLeads.map((l: any) => l.id === leadId ? { ...l, ...updates } : l);
    localStorage.setItem('pdfa2z_demo_leads', JSON.stringify(updated));
    return;
  }

  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  await updateDoc(leadRef, updates as any);
}

const SYNC_QUEUE_KEY = 'pdfa2z_sync_queue';

/**
 * Adds an item to the local sync queue for later retry
 */
export function addToSyncQueue(item: Omit<SyncItem, 'id' | 'retries'>) {
  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  queue.push({ ...item, id: `sync_${Date.now()}`, retries: 0 });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Attempts to process the sync queue
 */
export async function processSyncQueue(
  onLeadSynced?: (lead: any) => Promise<void>
) {
  const queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  const remaining: SyncItem[] = [];
  console.log(`[Sync] Processing ${queue.length} items...`);

  for (const item of queue) {
    if (item.retries > 5) continue; // Abandon after 5 tries

    try {
      if (item.type === 'lead_save' && onLeadSynced) {
        await onLeadSynced(item.data);
      }
      // Successfully processed
    } catch (e) {
      console.warn('[Sync] Retry failed for item:', item.id);
      remaining.push({ ...item, retries: item.retries + 1 });
    }
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
}
