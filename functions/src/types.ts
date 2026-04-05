// Shared types for Firebase Functions backend
// Keep in sync with services/notarizeService.ts on the frontend

export type DocumentType = 'power_of_attorney' | 'affidavit' | 'mortgage' | 'contract' | 'id_document' | 'other';
export type NotaryType   = 'acknowledgment' | 'jurat' | 'witness';
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface FirestoreUser {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  state_residence: string;
  user_type: 'individual' | 'business' | 'lawyer';
  stripe_customer_id?: string;
  referral_code?: string;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

export interface FirestoreDocument {
  user_id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  download_url: string;
  mime_type: string;
  upload_status: 'uploading' | 'ready' | 'processing' | 'error';
  document_type: DocumentType;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
  notarization_session_id?: string;
  is_deleted: boolean;
}

export interface FirestoreSession {
  user_id: string;
  document_id: string;
  onenotary_session_id?: string;
  status: SessionStatus;
  notary_type: NotaryType;
  num_signers: number;
  identity_verified: boolean;
  meeting_link?: string;
  notarized_document_url?: string;
  video_recording_url?: string;
  started_at: FirebaseFirestore.Timestamp;
  created_at: FirebaseFirestore.Timestamp;
  updated_at?: FirebaseFirestore.Timestamp;
  completed_at?: FirebaseFirestore.Timestamp;
  error_message?: string;
}

export interface FirestorePayment {
  user_id: string;
  notarization_session_id: string;
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  created_at: FirebaseFirestore.Timestamp;
}
