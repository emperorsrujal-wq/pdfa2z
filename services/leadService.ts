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
  updateDoc
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';
import { getCurrentUser } from './authService';
import { uploadFile } from './storageService';

export interface JourneyLead {
  id?: string;
  journeyId: string;     // Unique ID for the journey (filename or custom ID)
  journeyTitle: string;
  ownerId: string;      // The user ID of the person who created the journey
  data: Record<string, any>;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'closed';
  pdfUrl?: string;      // Link to the generated/filled PDF in Storage
  attachmentUrls?: string[]; // Links to raw file attachments
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
  attachments: { name: string, file: File | Blob }[] = []
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
