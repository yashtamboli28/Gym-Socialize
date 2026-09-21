import { PRSubmission } from '../types';

export interface SubmitPRPayload {
  userId: string;
  exercise: string;
  weight: number;
  reps: number;
  unit: string;
  videoFile?: File | null;
  videoUrl?: string;
  thumbnailUrl?: string;
  gymId?: string;
  notes?: string;
  isDemo?: boolean;
}

export interface ConfigStatus {
  cloudinaryConfigured: boolean;
  cloudName?: string | null;
  message: string;
}

/**
 * Check if Cloudinary credentials and server are configured
 */
export async function checkConfigStatus(): Promise<ConfigStatus> {
  try {
    const res = await fetch('/api/config/status');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not check config status:', err);
    return {
      cloudinaryConfigured: false,
      message: 'Unable to verify Cloudinary configuration status.',
    };
  }
}

/**
 * Fetch a user's PRs directly from the backend/database
 */
export async function fetchUserPRsFromDB(userId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/prs`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.prs || [];
  } catch (err: any) {
    console.error(`[API] Error fetching PRs for user ${userId}:`, err);
    throw err;
  }
}

/**
 * Fetch all PRs from the backend/database
 */
export async function fetchAllPRsFromDB(): Promise<any[]> {
  try {
    const res = await fetch('/api/prs');
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.prs || [];
  } catch (err: any) {
    console.error('[API] Error fetching all PRs:', err);
    throw err;
  }
}

/**
 * Submit PR video to backend:
 * 1. Backend uploads video to Cloudinary
 * 2. Cloudinary returns secure_url
 * 3. Backend saves secure_url in PostgreSQL through Prisma
 * 4. Returns saved PR record
 */
export async function submitPRToBackend(
  payload: SubmitPRPayload,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; pr: any; videoUrl: string }> {
  const formData = new FormData();
  formData.append('userId', payload.userId);
  formData.append('exercise', payload.exercise);
  formData.append('weight', String(payload.weight));
  formData.append('reps', String(payload.reps));
  formData.append('unit', payload.unit);

  if (payload.gymId) formData.append('gymId', payload.gymId);
  if (payload.notes) formData.append('notes', payload.notes);
  if (payload.isDemo) formData.append('isDemo', 'true');

  if (payload.videoFile) {
    formData.append('video', payload.videoFile);
  } else if (payload.videoUrl) {
    formData.append('videoUrl', payload.videoUrl);
  }

  if (payload.thumbnailUrl) {
    formData.append('thumbnailUrl', payload.thumbnailUrl);
  }

  // Use XMLHttpRequest to report progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/prs');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 90); // 0-90% is network transfer
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (onProgress) onProgress(100);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(response.error || `Upload failed with HTTP ${xhr.status}`));
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, pr: null, videoUrl: '' });
        } else {
          reject(new Error(`Server returned HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to backend.'));
    };

    xhr.send(formData);
  });
}
