import { auth } from '../config/firebase';

const MAX_SIZE = 7 * 1024 * 1024; // 7 MB (base64 overhead keeps us under the 9 MB function limit)

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to use server-side conversion.');
  return user.getIdToken();
}

async function callConvert(endpoint: 'word' | 'excel', file: File): Promise<Blob> {
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large for server conversion (max 7 MB). Try a smaller PDF.`);
  }

  const [token, base64] = await Promise.all([getToken(), fileToBase64(file)]);

  const res = await fetch(`/api/convert/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pdf: base64 }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(body.error || `Server error ${res.status}`);
  }

  const { file: b64, filename } = await res.json();
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const mimeMap: Record<string, string> = {
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return new Blob([bytes], { type: mimeMap[endpoint] });
}

export const serverConvertToWord = (file: File) => callConvert('word', file);
export const serverConvertToExcel = (file: File) => callConvert('excel', file);
